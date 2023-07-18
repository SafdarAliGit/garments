# Copyright (c) 2021, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class JobCosting(Document):
	@frappe.whitelist()
	def create_po(self, supplier):
		po = frappe.new_doc("Purchase Order")
		po.job_costing = self.name
		po.posting_date = frappe.utils.nowdate()
		po.schedule_date = frappe.utils.nowdate()
		po.supplier = supplier
		for fabric in self.fabrics:
			item = po.append("items")
			item.item_code = fabric.item_code
			item.qty = fabric.qty
			item.uom = fabric.uom
			item.rate = fabric.rate
		for acs in self.accessories:
			item = po.append("items")
			item.item_code = acs.item_code
			item.qty = acs.qty
			item.uom = acs.uom
			item.rate = acs.rate
		po.save()
		return po.name

	@frappe.whitelist()
	def create_so(self):
		so = frappe.new_doc("Sales Order")
		so.job_costing = self.name
		so.posting_date = frappe.utils.nowdate()
		so.delivery_date = frappe.utils.nowdate()
		so.customer = self.buyer
		so.currency = self.currency
		so.conversion_rate = self.exchange_rate
		so.append("items", {
			"item_code": self.style,
			"qty": self.total_qty,
			"rate": self.confirmed_price
		})
		so.save()
		return so.name
