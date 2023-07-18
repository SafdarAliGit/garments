import frappe
from frappe import _
from frappe.utils import cint, cstr


def bom_validation_for_percentage_fields(self, method):
	if self.items:
		ratio_sum = cint(sum(item.ratio for item in self.items if item.ratio))
		if ratio_sum != 100:
			frappe.throw(_('Sum of ratio is {0} it should be equal to 100').format(cstr(ratio_sum)))
