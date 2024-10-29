import frappe
from frappe.model.document import Document
from erpnext.stock.stock_ledger import get_valuation_rate
from erpnext.stock.utils import get_latest_stock_qty


class SubcontractingValueAdjustment(Document):

    def on_submit(self):
        self.pass_stock_ledger_entries()
        self.pass_gl_entries()

    def pass_stock_ledger_entries(self):
        current_date = frappe.utils.nowdate()  # Get current date
        current_time = frappe.utils.nowtime()  # Get current time

        for item in self.items:
            # Ensure necessary fields are available
            if not item.warehouse:
                frappe.throw(f"Warehouse must be defined for item {item.item_code}")

            # Fetch the existing Stock Ledger Entry based on the given criteria
            # sle_name = frappe.get_value(
            #     "Stock Ledger Entry",
            #     {
            #         "voucher_no": item.receipt_document,
            #         "voucher_detail_no": item.receipt_child_id,
            #         "voucher_type": "Subcontracting Receipt"
            #     },
            #     "name"
            # )

            # if not sle_name:
            #     frappe.throw(f"No Stock Ledger Entry found for item {item.item_code} with voucher {item.receipt_document}")

            # Update the is_cancelled field to 1 for the found Stock Ledger Entry
            # frappe.db.set_value("Stock Ledger Entry", sle_name, "is_cancelled", 1)

            # First Entry: Negative quantity change and 0 valuation rate
            last_sle = frappe.get_last_doc(
                "Stock Ledger Entry",
                filters={"item_code": item.item_code},
                order_by="posting_date desc, posting_time desc"
            )

            # Get the last valuation rate, or use 0 if no record is found
            last_valuation_rate = last_sle.valuation_rate if last_sle else 0

            try:
                # First Entry: Negative quantity change and 0 valuation rate
                sle_negative = frappe.get_doc({
                    "doctype": "Stock Ledger Entry",
                    "item_code": item.item_code,
                    "warehouse": item.warehouse,
                    "posting_date": current_date,
                    "posting_time": current_time,
                    "voucher_type": "Subcontracting Receipt",
                    "voucher_no": item.receipt_document,
                    "voucher_detail_no": item.receipt_child_id,
                    "actual_qty": -item.qty,  # Negative quantity
                    "valuation_rate": last_valuation_rate,  # No valuation for negative entry
                    "outgoing_rate": item.rate,
                    "company": self.company,
                    "stock_value": 0
                })
                sle_negative.insert(ignore_permissions=True)
                sle_negative.submit()

                # Second Entry: Positive quantity change and updated valuation rate
                valuation_rate = item.rate + (item.applicable_charges / item.qty)
                stock_value_difference = item.amount + item.applicable_charges
                qty_after_transaction = get_latest_stock_qty(item.item_code, item.warehouse)

                sle_positive = frappe.get_doc({
                    "doctype": "Stock Ledger Entry",
                    "item_code": item.item_code,
                    "warehouse": item.warehouse,
                    "posting_date": current_date,
                    "posting_time": current_time,
                    "voucher_type": "Subcontracting Receipt",
                    "voucher_no": item.receipt_document,
                    "voucher_detail_no": item.receipt_child_id,
                    "actual_qty": item.qty,  # Positive quantity
                    "valuation_rate": valuation_rate,
                    "incoming_rate": item.rate,
                    "company": self.company,
                    "stock_value_difference": stock_value_difference,
                    "qty_after_transaction": qty_after_transaction,
                    "stock_value": stock_value_difference
                })
                sle_positive.insert(ignore_permissions=True)
                sle_positive.submit()

            except Exception as e:
                frappe.log_error(f"Error creating Stock Ledger Entries for item {item.item_code}: {str(e)}")
                frappe.throw("Error while processing stock ledger entries.")

    def pass_gl_entries(self):
        current_date = frappe.utils.nowdate()  # Get current date
        current_time = frappe.utils.nowtime()  # Get current time
        company = frappe.defaults.get_defaults().get("company")

        for item in self.taxes:
            try:
                gle_credit = frappe.new_doc("GL Entry")
                gle_credit.posting_date = current_date
                gle_credit.account = item.expense_account
                gle_credit.cost_center = frappe.get_cached_value("Company", company, "cost_center")
                gle_credit.debit = 0
                gle_credit.debit_in_account_currency = 0
                gle_credit.credit = item.amount
                gle_credit.credit_in_account_currency = item.amount
                gle_credit.against = 'Stock In Hand - MTI&E'
                gle_credit.voucher_type = 'Subcontracting Value Adjustment'
                gle_credit.voucher_no = item.parent
                gle_credit.company = company

                gle_debit = frappe.new_doc("GL Entry")
                gle_debit.posting_date = current_date
                gle_debit.account = 'Stock In Hand - MTI&E'
                gle_debit.cost_center = frappe.get_cached_value("Company", company, "cost_center")
                gle_debit.credit = 0
                gle_debit.credit_in_account_currency = 0
                gle_debit.debit = item.amount
                gle_debit.debit_in_account_currency = item.amount
                gle_debit.against = item.expense_account
                gle_debit.voucher_type = 'Subcontracting Value Adjustment'
                gle_debit.voucher_no = item.parent
                gle_debit.company = company

                gle_credit.save()
                gle_debit.save()

            except Exception as e:
                frappe.throw(str(e))
