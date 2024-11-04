import frappe


@frappe.whitelist()
def create_purchase_invoice(sco_name, master_towel_costing,
                            supplier, qty):
    sco = frappe.get_doc("Subcontracting Order", sco_name)
    doc = frappe.new_doc("Purchase Invoice")
    doc.supplier = supplier
    doc.master_towel_costing = master_towel_costing
    doc.posting_date = frappe.utils.nowdate()
    doc.posting_time = frappe.utils.nowtime()

    it = doc.append("items", {})
    it.item_code = sco.service_items[0].item_code
    it.master_towel_costing = master_towel_costing
    it.rate = sco.service_items[0].rate
    it.qty = qty
    it.item_name = sco.service_items[0].item_name
    it.uom = 'LBS'
    it.amount = float(sco.service_items[0].rate) * float(qty)

    return doc
