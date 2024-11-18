import frappe
from frappe import _


def on_submit(self, method):
    # existing_pr = frappe.db.exists('Purchase Receipt', {'subcontracting_receipt_no': scr})
    # if existing_pr:
    #     frappe.throw("Purchase Receipt already exists")
    scr_doc = frappe.get_doc("Subcontracting Receipt", self.name)
    subcontracting_order = self.items[0].subcontracting_order
    sco = frappe.get_doc("Subcontracting Order", subcontracting_order)
    doc = frappe.new_doc("Purchase Receipt")
    doc.supplier = self.supplier
    doc.master_towel_costing = self.master_towel_costing
    doc.posting_date = frappe.utils.nowdate()
    doc.posting_time = frappe.utils.nowtime()
    doc.subcontracting_receipt_no = self.name
    doc.subcontracting_order_no = subcontracting_order
    for i in scr_doc.items:
        it = doc.append("items", {})
        it.item_code = sco.service_items[0].item_code
        it.subcontracting_receipt_items = i.item_code
        it.master_towel_costing = self.master_towel_costing
        it.rate = i.service_cost_per_qty
        it.qty = i.qty
        it.item_name = sco.service_items[0].item_name
        it.uom = 'LBS'
        it.stock_uom = 'LBS'
        it.description = sco.service_items[0].item_name
        it.amount = float(i.service_cost_per_qty) * float(i.qty)

    doc.save(ignore_permissions=True)

    for item in self.items:
        try:
            # Retrieve the Subcontracting Order Item document where parent matches and item_code matches
            soi = frappe.get_list(
                "Subcontracting Order Item",
                filters={"parent": item.subcontracting_order, "item_code": item.item_code},
                fields=["name", "item_code", "parent"]
            )

            if not soi:
                frappe.log_error(f"No Subcontracting Order Item found for {item.item_code} in {self.name}",
                                 "on_submit Error")
                continue

            # Fetch the first matching Subcontracting Order Item document
            scoi = frappe.get_doc("Subcontracting Order Item", soi[0].name)
            # Check if pcs is present and matches the subcontracting order item
            if item.pcs:
                scoi.qty_pcs_receipt += float(item.pcs)
                scoi.save()

        except frappe.DoesNotExistError:
            frappe.log_error(f"Subcontracting Order Item {item.subcontracting_order} not found.", "on_submit Error")
        except Exception as e:
            frappe.log_error(f"Error updating Subcontracting Order Item {item.subcontracting_order}: {str(e)}",
                             "on_submit Error")


