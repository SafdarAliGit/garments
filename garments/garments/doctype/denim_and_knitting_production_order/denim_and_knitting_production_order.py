# Copyright (c) 2022, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class DenimandKnittingProductionOrder(Document):
	def before_submit(self):
		#self.create_operations()
		pass
	def validate(self):
		self.set_totals()

	@frappe.whitelist()
	def set_materials(self):
		self.materials = []
		if self.job_costing:
			for r in frappe.get_all("Job Costing Fabric", filters={"parent":self.job_costing}, fields=["*"]):
				self.append("materials", {
					"item_code":r.item_code,
					"qty": r.qty * self.qty,
					"rate":r.rate,
					"uom":r.uom,
					"amount":r.rate * r.qty * self.qty,
				
					})

			for r in frappe.get_all("Job Costing Accessory", filters={"parent":self.job_costing}, fields=["*"]):
				self.append("materials", {
					"item_code":r.item_code,
					"qty": r.qty * self.qty,
					"rate":r.rate,
					"uom":r.uom,
					"amount":r.rate * r.qty * self.qty,
					
					})
			self.set_totals()

	def set_totals(self):
		self.total_raw_material_cost = 0
		for m in self.materials:
			self.total_raw_material_cost = self.total_raw_material_cost + m.amount

		self.total_operation_cost = 0
		for o in self.operations:
			self.total_operation_cost = self.total_operation_cost + o.operation_cost
		self.total_cost_of_denim_production_order = self.total_raw_material_cost + self.total_operation_cost
		self.difference = self.total_cost_of_denim_production_order - self.job_costing_total_cost_in_pkr


	def set_totals(self):
		self.total_raw_material_cost = 0
		for m in self.materials:
			self.total_raw_material_cost = self.total_raw_material_cost + m.amount

	@frappe.whitelist()
	def create_operations(self):
		for o in self.operations:
			op = frappe.new_doc("Denim Operation")
			op.denim_and_knitting_production_order = self.name
			op.denim_operation_type = o.denim_operation_type
			op.source_warehouse = o.source_warehouse
			op.target_warehouse = o.target_warehouse
			for m in self.materials:
				if m.target_warehouse == o.source_warehouse:
					op.append("materials", {
						"item_code": m.item_code,
						"qty":m.qty * self.qty,
						"rate":m.rate,
						"amount":m.qty * self.qty * m.rate

						})
			op.save()
			o.denim_operation = op.name