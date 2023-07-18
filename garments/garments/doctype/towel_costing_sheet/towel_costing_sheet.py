
# Copyright (c) 2022, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class TowelCostingSheet(Document):
	def on_update(self):
		doc = frappe.get_doc("Master Towel Costing", self.master_towel_costing)
		if not frappe.db.exists("Master Towel Costing Item", {"parent":self.master_towel_costing, "towel_costing_sheet":self.name}):
			doc.append("items", {
				"towel_costing_sheet": self.name
			})
		else:
			for row in doc.items:
				if row.towel_costing_sheet == self.name:
					row.width = self.width
					row.length = self.length
					row.qty = self.qty
		
		doc.setup_materials()
		doc.save()

	def before_save(self):
		if self.total_ratio != 100:
			frappe.throw("Ratio must be equal to 100.")

