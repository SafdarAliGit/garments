import frappe


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

    return doc
