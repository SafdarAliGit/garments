import frappe

def execute():
    jcs = frappe.get_all("Job Costing")
    for j in jcs:
        jc = frappe.get_doc("Job Costing", j)
        jc.raw_material_cost = jc.accessories_total + jc.fabrics_total
        jc.total_raw_material_required = jc.raw_material_cost * jc.order_qty
        jc.grand_total_raw_material = jc.total_raw_material_required + (jc.total_raw_material_required * 0.03)
        jc.save()