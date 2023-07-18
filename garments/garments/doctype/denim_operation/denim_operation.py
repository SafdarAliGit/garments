# Copyright (c) 2022, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from erpnext.stock.utils import get_stock_balance
from frappe.model.document import Document

class DenimOperation(Document):
	def before_submit(self):
		self.post_stock_entry()
		if self.expenses:
			self.post_journal_entry()

	@frappe.whitelist()
	def get_materials(self):
		self.materials = []
		if self.denim_and_knitting_production_order:
			po = frappe.get_doc("Denim and Knitting Production Order", self.denim_and_knitting_production_order)
			for row in po.materials:
				if row.source_warehouse == self.source_warehouse:
					self.append("materials",{
						"item_code":row.item_code,
						"qty": row.qty,
						"rate": row.rate,
						"amount":row.amount,
						"uom":row.uom,
						"available_qty": get_stock_balance(item_code=row.item_code, warehouse=self.source_warehouse)
						})


	def post_stock_entry(self):
		se = frappe.new_doc("Stock Entry")
		se.stock_entry_type = "Manufacture"
		se.denim_operation = self.name
		se.set_posting_time = 1
		se.posting_date = self.posting_date
		for material in self.materials:
			sei = se.append("items")
			sei.s_warehouse = self.source_warehouse
			sei.item_code = material.item_code
			sei.uom = material.uom
			sei.qty = material.qty
			sei.basic_rate = material.rate
		sefi = se.append("items")
		sefi.t_warehouse = self.target_warehouse
		sefi.item_code = self.finished_item
		sefi.uom = self.uom
		sefi.qty = self.finished_qty
		sefi.basic_rate = self.total_cost_per_piece
		se.save()
		se.submit()


	def post_journal_entry(self):
		jv = frappe.new_doc("Journal Entry")
		jv.voucher_type = "Journal Entry"
		jv.denim_operation = self.name
		jv.posting_date = self.posting_date
		for exp in self.expenses:
			jva = jv.append("accounts")
			jva.account = exp.account
			jva.credit_in_account_currency = exp.amount
			if exp.party:
				jva.party_type = "Supplier"
				jva.party = exp.party

		jvac = jv.append("accounts")
		jvac.account = frappe.db.get_value("Denim Operation Type", self.denim_operation_type, "operation_expense_payable_account")
		jvac.debit_in_account_currency = self.total_expenses
		jv.save()
		jv.submit()

	@frappe.whitelist()
	def get_last_purchase_rate(self, item_code=None):
		item_last_purchase_rate_map = {}

		query = """select * from (
					(select
						po_item.item_code,
						po.transaction_date as posting_date,
						po_item.base_rate
					from `tabPurchase Order` po, `tabPurchase Order Item` po_item
						where po.name = po_item.parent and po.docstatus = 1)
					union
					(select
						pr_item.item_code,
						pr.posting_date,
						pr_item.base_rate
					from `tabPurchase Receipt` pr, `tabPurchase Receipt Item` pr_item
						where pr.name = pr_item.parent and pr.docstatus = 1)
					union
					(select
						pi_item.item_code,
						pi.posting_date,
						pi_item.base_rate
					from `tabPurchase Invoice` pi, `tabPurchase Invoice Item` pi_item
						where pi.name = pi_item.parent and pi.docstatus = 1 and pi.update_stock = 1)
					) result order by result.item_code asc, result.posting_date asc"""

		for d in frappe.db.sql(query, as_dict=1):
			item_last_purchase_rate_map[d.item_code] = d.base_rate
		if item_code:
			return item_last_purchase_rate_map[item_code]
		return 0