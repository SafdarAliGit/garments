
import frappe
from frappe.utils import flt
from erpnext.subcontracting.doctype.subcontracting_order.subcontracting_order import SubcontractingOrder


class OverriddenSubcontractingOrder(SubcontractingOrder):
	def set_missing_values_in_supplied_items(self):
		for item in self.get("items"):
			bom = frappe.get_doc("BOM", item.bom)
			rm_cost = sum(flt(rm_item.amount) for rm_item in bom.items)
			item.rm_cost_per_qty = rm_cost / flt(bom.quantity)
		additional_fields = ['use_in', 'ratio', 'bags']
		for supplied_item in self.get('supplied_items'):
			for field in additional_fields:
				if frappe.get_meta('BOM Item').has_field(field) and supplied_item.bom_detail_no:
					if field == 'bags':
						bom_detail_qty = frappe.get_cached_value('BOM Item', supplied_item.bom_detail_no, 'qty')
						supplied_item_field_value = flt(bom_detail_qty/100)
					else:
						supplied_item_field_value = frappe.get_cached_value('BOM Item', supplied_item.bom_detail_no, field)
					supplied_item.db_set(field, supplied_item_field_value)
