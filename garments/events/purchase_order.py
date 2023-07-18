import frappe

def validate(doc, method=None):
    if doc.job_costing:
        prev_purchase = frappe.db.get_value("Purchase Order", {"docstatus":1, "job_costing":doc.job_costing}, "sum(total)") or 0
        cur_purchase = doc.total
        max_purchase = frappe.db.get_value("Job Costing", doc.job_costing, "grand_total_raw_material") or 0
        allowed_purchase = max_purchase - prev_purchase
        if   (prev_purchase + cur_purchase) > max_purchase:
            frappe.throw("""<h4>Purchas Limit Exceeded.</h4>
                            An amount of <strong>{amount}</strong> purchase have been done previously against Job Costing <strong>{job}</strong> and the maximum purchase of <strong>{allowed_purchase}</strong> is allowed for this order.
            """.format(amount=format_currency(prev_purchase), allowed_purchase=format_currency(allowed_purchase), job=doc.job_costing))

def format_currency(amount):
    return frappe.format_value(amount, {"fieldtype":"Currency"})