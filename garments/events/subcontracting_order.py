import frappe


def calculate_total_reqiured_qty_and_no_bags(self, doc):
	if self.get('supplied_items'):
		total_required_qty = 0
		total_no_of_bags = 0
		for supplied_item in self.get('supplied_items'):
			total_required_qty += supplied_item.required_qty
			total_no_of_bags += supplied_item.bags

		self.total_required_qty = total_required_qty
		self.total_no_of_bags = total_no_of_bags
