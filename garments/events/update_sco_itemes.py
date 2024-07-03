import frappe
from frappe import _


def on_submit(self, method):
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


