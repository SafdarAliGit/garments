import frappe
from frappe.model.document import Document
from erpnext.stock.stock_ledger import get_valuation_rate
from erpnext.stock.utils import  get_stock_balance


class SubcontractingValueAdjustment(Document):

    def on_submit(self):
        self.pass_stock_ledger_entries()

    def pass_stock_ledger_entries(self):
        current_date = frappe.utils.nowdate()  # Get current date
        current_time = frappe.utils.nowtime()  # Get current time

        for item in self.items:
            # Ensure necessary fields are available
            if not item.warehouse:
                frappe.throw(f"Warehouses must be defined for item {item.item_code}")

            # Fetch the first existing Stock Ledger Entry where voucher_no = item.receipt_document and voucher_detail_no = item.receipt_child_id
            sle_name = frappe.get_value("Stock Ledger Entry",
                                        {"voucher_no": item.receipt_document,
                                         "voucher_detail_no": item.receipt_child_id,
                                         "voucher_type": "Subcontracting Receipt", },
                                        "name")

            # If an entry is found, update its is_cancelled field to 1

            if sle_name:
                sle = frappe.get_doc("Stock Ledger Entry", sle_name)
                frappe.db.set_value("Stock Ledger Entry", sle_name, "is_cancelled", 1)

                # Commit the changes to the database
                frappe.db.commit()

            # First Entry: Negative qty_change and 0 valuation rate
            sle_negative = frappe.get_doc({
                "doctype": "Stock Ledger Entry",
                "item_code": item.item_code,
                "warehouse": item.warehouse,  # Use source warehouse for negative entry
                "posting_date": current_date,
                "posting_time": current_time,
                "voucher_type": 'Subcontracting Receipt',
                "voucher_no": item.receipt_document,
                "voucher_detail_no": item.receipt_child_id,
                "actual_qty": -item.qty,  # Negative quantity
                "qty_after_transaction": 0,  # Set this appropriately if needed
                "valuation_rate": 0,  # 0 valuation for the first entry
                "outgoing_rate": item.rate,
                "company": self.company,
                "is_cancelled": 1
            })
            sle_negative.insert(ignore_permissions=True)
            sle_negative.submit()

            # Second Entry: Positive qty_change and updated valuation rate
            sle_positive = frappe.get_doc({
                "doctype": "Stock Ledger Entry",
                "item_code": item.item_code,
                "warehouse": item.warehouse,  # Use target warehouse for positive entry
                "posting_date": current_date,
                "posting_time": current_time,
                "voucher_type": 'Subcontracting Receipt',
                "voucher_no": item.receipt_document,
                "voucher_detail_no": item.receipt_child_id,
                "actual_qty": item.qty,  # Positive quantity
                "valuation_rate": item.rate,  # Updated valuation rate
                "incoming_rate": item.rate + item.applicable_charges / item.qty,
                "company": self.company,
                "stock_value_difference": item.amount + item.applicable_charges,
                "qty_after_transaction": get_stock_balance(item.item_code, item.warehouse) + item.qty,
                "stock_value":sle.stock_value + sle.stock_value_difference
            })
            sle_positive.insert(ignore_permissions=True)
            sle_positive.submit()
