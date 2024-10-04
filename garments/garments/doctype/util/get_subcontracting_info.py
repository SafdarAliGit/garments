import frappe


@frappe.whitelist()
def get_subcontracting_info(name):
    sr = frappe.db.get_value("Subcontracting Receipt", name, ["supplier", "total"], as_dict=True)

    if sr:
        return sr
    else:
        frappe.throw(f"Subcontracting Receipt {name} not found")
