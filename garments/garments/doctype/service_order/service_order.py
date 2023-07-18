# Copyright (c) 2021, Unilink Enterprise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ServiceOrder(Document):
	def before_update(self):
		self.set_totals()
	def before_submit(self):
		self.book_commission()

	@frappe.whitelist()
	def set_totals(self):
		self.received = 0
		self.delivered = 0
		total_qty = 0
		for item in self.customer_items:
			self.received = self.received + item.qty_received
			self.delivered = self.delivered + item.qty_delivered
			total_qty = total_qty + item.qty
		self.received = (self.received / total_qty) * 100
		self.delivered = 10

	@frappe.whitelist()
	def receive_material(self):
		ss = frappe.get_doc("Service Settings")
		if self.customer_items:
			ste = frappe.new_doc("Stock Entry")
			ste.posting_date = frappe.utils.nowdate()
			ste.to_warehouse = self.accepted_warehouse
			if not ss.stock_entry_receive_type:
				frappe.throw("Please set Stock Entry Receive Type in Service Settings first.")
			ste.stock_entry_type = ss.stock_entry_receive_type

			ste.service_order = self.name
			for citem in self.customer_items:
				item =ste.append("items")
				item.item_code = citem.item_code
				item.qty = citem.qty - citem.qty_received
				item.uom = citem.uom
				if ss.customer_stock_account:
					item.expense_account = ss.customer_stock_account
			ste.save()
			return ste.name

	@frappe.whitelist()
	def deliver_material(self):
		ss = frappe.get_doc("Service Settings")
		if self.customer_items:
			ste = frappe.new_doc("Stock Entry")
			ste.posting_date = frappe.utils.nowdate()
			ste.from_warehouse = self.accepted_warehouse
			if not ss.stock_entry_receive_type:
				frappe.throw("Please set Stock Entry Receive Type in Service Settings first.")
			ste.stock_entry_type = ss.stock_entry_deliver_type

			ste.service_order = self.name
			for citem in self.customer_items:
				item =ste.append("items")
				item.item_code = citem.item_code
				item.qty = citem.qty_processed - citem.qty_delivered
				item.uom = citem.uom
				if ss.customer_stock_account:
					item.expense_account = ss.customer_stock_account
			ste.save()
			return ste.name

	@frappe.whitelist()
	def create_invoice(self):
		inv = frappe.new_doc("Sales Invoice")
		inv.posting_date = frappe.utils.nowdate()
		inv.customer = self.customer
		inv.service_order = self.name
		for item in self.items:
			invi = inv.append("items")
			invi.item_code = item.item_code
			invi.uom = item.uom
			invi.qty = item.qty
			invi.rate = item.rate
		inv.save()
		return inv.name

	@frappe.whitelist()
	def create_supplier_inv(self, supplier):
		inv = frappe.new_doc("Purchase Invoice")
		inv.posting_date = frappe.utils.nowdate()
		inv.supplier = supplier
		inv.service_order = self.name
		for item in self.processes:
			if item.supplier == supplier:
				invi = inv.append("items")
				invi.item_code = item.item_code
				invi.uom = item.uom
				invi.qty = item.qty
				invi.rate = item.rate
		inv.save()
		return inv.name

	@frappe.whitelist()
	def process_item(self, item_code, qty_processed, qty):
		ss = frappe.get_doc("Service Settings")
		ste = frappe.new_doc("Stock Entry")
		ste.stock_entry_type = ss.consumables_stock_entry_type
		ste.service_order = self.name
		ste.from_warehouse = self.consumables_warehouse
		for item in self.consumables:
			ste.append("items", {
				"item_code": item.item_code,
				"qty": (item.qty/qty) * qty_processed,
				"uom": item.uom
			})
		ste.save()
		qty_processedo, qtyo = frappe.db.get_value("Customer Provided Item", {"parent":self.name, "item_code":item_code}, ["qty_processed", "qty"])
		frappe.db.set_value("Customer Provided Item", {"parent":self.name, "item_code":item_code}, "qty_processed", (qty_processed + qty_processedo or 0))
		frappe.db.set_value("Service Order", self.name, "processed", ((qty_processed + qty_processedo or 0)/qtyo) * 100)

		return ste.name


	@frappe.whitelist()
	def book_commission(self):
		if self.commission_amount > 0 and self.sales_partner:
			ss = frappe.get_doc("Service Settings")
			jv = frappe.new_doc("Journal Entry")
			jv.posting_date = frappe.utils.nowdate()
			jv.append("accounts", {
				"account": ss.commission_payable_account,
				"party_type": "Supplier",
				"party": self.sales_partner,
				"credit_in_account_currency": self.commission_amount
			})
			jv.append("accounts", {
				"account": ss.commission_expense_account,
				"debit_in_account_currency": self.commission_amount
			})
			jv.user_remarks = "Commission booked agianst Service Order No:"+self.name
			jv.save()
			jv.submit()



