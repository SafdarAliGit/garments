# Copyright (c) 2022, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import cint
class MasterTowelCosting(Document):
	def before_save(self):
		self.setup_materials()
		self.setup_costs()
		
	
	@frappe.whitelist()
	def create_po(self, supplier):
		po = frappe.new_doc("Purchase Order")
		po.transaction_date = frappe.utils.now()
		po.schedule_date = frappe.utils.now()
		po.supplier = supplier
		for m in self.materials:
			po.append("items", {
				"item_code": m.raw_material,
				"rate": m.price,
				"qty": m.yarn_required_in_lbs,
				"qty_in_bags": m.bags_reqd
			})
		po.save()
		return po.name

	@frappe.whitelist()
	def create_mr(self, supplier=None):
		pr = frappe.new_doc("Material Request")
		pr.edit_posting_time = 1
		pr.posting_date = frappe.utils.now()
		pr.schedule_date = frappe.utils.now()
		pr.supplier = supplier
		for m in self.materials:
			pr.append("items", {
				"item_code": m.raw_material,
				"rate": m.price,
				"qty": m.yarn_required_in_lbs,
				"qty_in_bags": m.bags_reqd
			})
		pr.save()
		return pr.name

	def setup_materials(self):
		self.materials = []
		for row in self.items:
			doc = frappe.get_doc("Towel Costing Sheet", row.towel_costing_sheet)
			
			for r in doc.materials:
				flag = 0
				for sr in self.materials:
					if r.raw_material == sr.raw_material:
						flag = 1
						sr.price = r.price if r.price else sr.price
						sr.yarn_required_in_lbs = sr.yarn_required_in_lbs + r.yarn_required_in_lbs
						sr.bags_reqd = sr.yarn_required_in_lbs /100
						sr.cost = sr.yarn_required_in_lbs * sr.price
				if flag == 0:
					self.append("materials", {
						"raw_material": r.raw_material,
						"price":r.price,
						"yarn_required_in_lbs":r.yarn_required_in_lbs,
						"bags_reqd":r.bags_reqd,
						"cost":r.cost
					})



	def setup_costs(self):
		self.costs = []
		for row in self.items:
			doc = frappe.get_doc("Towel Costing Sheet", row.towel_costing_sheet)
			self.append("costs", {
				"towel_costing_sheet": row.towel_costing_sheet,
				"size": "{0}X{1}".format(cint(doc.length), cint(doc.width)),
				"weight_with_wastage": doc.weight_with,
				"total_weight": doc.total_weight,
				"qty":doc.qty,
				"qtykg":doc.towels_per_kg,
				"dying":doc.dyeing,
				"weaving":doc.weaving_oh,
				"stitching":doc.stitching_cost_per_piece,
				"accessories":doc.accessories_per_piece,
				"wastage":doc.wastage_per_piece,
				"clearing":doc.clearing_per_piece,
				"bank":doc.bank_oh_profit_per_piece

			})
		self.set_totals()

	def set_totals(self):
		self.qty = 0
		self.qtykg = 0
		self.dying = 0
		self.weaving = 0
		self.stitching = 0
		self.accessories = 0
		self.wastage = 0
		self.clearing = 0
		self.bank = 0
		self.total_weight_to_deliver = 0
		self.total_weight_with_wastage = 0
		for row in self.costs:
			self.total_weight_to_deliver = cint(self.total_weight_to_deliver) + cint(row.total_weight)
			self.total_weight_with_wastage = cint(self.total_weight_with_wastage) + cint(row.weight_with_wastage)
			self.qty = self.qty + row.qty
			self.dying = self.dying + self.get_cost(row.towel_costing_sheet, "dyeing_cost_total")
			self.weaving = self.weaving + self.get_cost(row.towel_costing_sheet, "weaving_oh_cost_total")
			self.stitching = self.stitching + self.get_cost(row.towel_costing_sheet, "stitching_cost_total")
			self.accessories = self.accessories + self.get_cost(row.towel_costing_sheet, "accessories_cost_total")
			self.wastage = self.wastage + self.wastage
			self.clearing = self.clearing + self.get_cost(row.towel_costing_sheet, "clearing_freight_total")
			self.bank = self.bank + row.bank
			self.qtykg = self.qtykg + row.qtykg
		if self.costs and self.qtykg > 0:
			self.qtykg = self.qtykg/len(self.costs)
		self.raw_material_cost = 0
		for i in self.materials:
			self.raw_material_cost = self.raw_material_cost + i.cost

		self.other_cost = self.dying + self.weaving + self.stitching + self.accessories + self.wastage + self.clearing + self.bank
		self.total_amount = self.raw_material_cost + self.other_cost
		if self.qty > 0:
			self.cost_pcs = self.total_amount / self.qty
			self.cost_kg = self.cost_pcs * self.qtykg


	def get_cost(self, tc, value):
		return frappe.db.get_value("Towel Costing Sheet", tc, value)