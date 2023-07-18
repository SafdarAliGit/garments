// Copyright (c) 2021, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Job Costing', {
	refresh(frm) {
		/*frm.add_custom_button("Create PO", function(){
			frappe.prompt([
			    {'fieldname': 'supplier', 'fieldtype': 'Link', 'options':'Supplier', 'label': 'Suppler', 'reqd': 1}
			],
			function(values){
			    frappe.call({
					method:"create_po",
					doc:frm.doc,
					args:{supplier:values.supplier},
					callback:function(r){
						frappe.set_route("Form", "Purchase Order", r.message)
					}
				})
			},
			'Supplier for PO',
			'Create PO'
			)
			Confirm 


			
		})*/
		frm.add_custom_button("Create SO", function(){
		    frappe.call({
				method:"create_so",
				doc:frm.doc,
				callback:function(r){
					frappe.set_route("Form", "Sales Order", r.message)
				}
			})
		})
	},
	other_expenses_section(frm){
		frm.trigger("set_total");
	},
	other_expenses(frm){
		frm.trigger("set_total");
	},
	financial_charges(frm){
		frm.trigger("set_total");
	},
	testing(frm){
		frm.trigger("set_total");
	},
	fob_shipment_handling_charges(frm){
		frm.trigger("set_total");
	},
	self_courier(frm){
		frm.trigger("set_total");
	},
	third_party_inspection_charges(frm){
		frm.trigger("set_total");
	},
	metal_trims_import_cost(frm){
		frm.trigger("set_total");
	},
	paper_trims_import_cost(frm){
		frm.trigger("set_total");
	},
	misc_charges(frm){
		frm.trigger("set_total");
	},
	set_total(frm){
		var f = frm.doc;
		frm.set_value("total", f.other_expenses+f.financial_charges+f.testing+f.fob_shipment_handling_charges+f.self_courier+f.third_party_inspection_charges+f.metal_trims_import_cost+f.paper_trims_import_cost+f.misc_charges)
	},
	special_process(frm){
		frm.set_value("cm_cost", frm.doc.special_process+frm.doc.cutting+frm.doc.stitching_charges+frm.doc.finishing+frm.doc.add)
	},
	cutting(frm){
		frm.trigger("special_process")
	},
	stitching_charges(frm){
		frm.trigger("special_process")
	},
	finishing(frm){
		frm.trigger("special_process")
	},
	add(frm){
		frm.trigger("special_process")
	},
	total(frm){
		frm.set_value("net_making_cost", frm.doc.total+frm.doc.fabrics_total + frm.doc.accessories_total+frm.doc.washing_cost+frm.doc.cm_cost)
	},
	cm_cost(frm){
		frm.trigger("total")
	},
	washing_cost(frm){
		frm.trigger("total")
	},
	fabrics_total(frm){
		frm.set_value("raw_material_cost", frm.doc.accessories_total + frm.doc.fabrics_total)
		frm.trigger("total")
	},
	accessories_total(frm){
		frm.trigger("fabrics_total")
	},
	raw_material_cost(frm){
		frm.set_value("total_raw_material_required", frm.doc.raw_material_cost * frm.doc.order_qty)
	},
	total_raw_material_required(frm){
		frm.set_value("grand_total_raw_material", frm.doc.total_raw_material_required + (frm.doc.total_raw_material_required * 0.03))
	},

	net_making_cost(frm){
		frm.trigger("wastage")
	},
	wastage(frm){
		frm.set_value("wastage_amount", frm.doc.net_making_cost * (frm.doc.wastage/100))
	},
	net_making_cost(frm){
		frm.trigger("wastage_amount")
	},
	wastage_amount(frm){
		frm.set_value("total_net_making_cost", frm.doc.net_making_cost+frm.doc.wastage_amount)
	},
	total_net_making_cost(frm){
		frm.trigger("commission")
		frm.trigger("profit")
	},
	commission(frm){
		frm.set_value("commission_amount", frm.doc.total_net_making_cost * (frm.doc.commission /100))
	},
	profit(frm){
		frm.set_value("profit_amount", frm.doc.total_net_making_cost * (frm.doc.profit /100))
	},
	order_qty(frm){
		frm.set_value("total_qty", frm.doc.order_qty)
		frm.trigger("total_raw_material_required")
	},
	profit_amount(frm){
		frm.set_value("total_gross_making_per_piece_cost_pkr", frm.doc.total_net_making_cost+frm.doc.commission_amount+frm.doc.profit_amount)
		frm.set_value("total_gross_making_cost", frm.doc.total_gross_making_per_piece_cost_pkr * frm.doc.total_qty)
	},
	commission_amount(frm){
		frm.trigger("profit_amount")
	},
	total_net_making_cost(frm){
		frm.trigger("profit_amount")
	},
	total_gross_making_cost(frm){
		if(frm.doc.exchange_rate > 0){
			frm.set_value("total_gross_making_per_piece_cost_in_usd", frm.doc.total_gross_making_per_piece_cost_pkr / frm.doc.exchange_rate)	
		}
		else{
			frm.set_value("total_gross_making_per_piece_cost_in_usd", 0)
		}
		frm.set_value("total_gross_making_cost_in_usd", frm.doc.total_gross_making_per_piece_cost_in_usd * frm.doc.total_qty)
		frm.trigger("total_invoice_amount_in_pkr")
	},
	total_invoice_amount_in_pkr(frm){
		frm.set_value("total_profit_in_pkr", frm.doc.total_invoice_amount_in_pkr - frm.doc.total_gross_making_cost)	
	},
	total_gross_making_cost_in_usd(frm){
		frm.set_value("total_profit", frm.doc.total_invoice_amount - frm.doc.total_gross_making_cost_in_usd)	
	},
	total_invoice_amount(frm){
		frm.trigger("total_invoice_amount")
	},
	total_gross_making_per_piece_cost_in_usd(frm){
		frm.set_value("quoted", frm.doc.total_gross_making_per_piece_cost_in_usd)
	},
	exchange_rate(frm){
		frm.trigger("total_gross_making_cost")
		frm.trigger("total_invoice_amount")
		frm.trigger("profit_amount")
	},
	quoted(frm){
		frm.set_value("difference", frm.doc.target - frm.doc.quoted)
	},
	target(frm){
		frm.trigger("quoted")
		frm.set_value("confirmed_price", frm.doc.target)
	},
	confirmed_price(frm){
		frm.set_value("total_invoice_amount", frm.doc.total_qty * frm.doc.confirmed_price)
	},
	total_qty(frm){
		frm.trigger("confirmed_price")
		frm.trigger("profit_amount")
	},
	total_invoice_amount(frm){
		frm.set_value("total_invoice_amount_in_pkr", frm.doc.total_invoice_amount * frm.doc.exchange_rate)
		
	},
	before_save(frm){
		frm.trigger("net_making_cost")
	}
	
});


frappe.ui.form.on('Job Costing Fabric', {
	qty(frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)	
		set_fabrics_total(frm)
	},
	rate(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
		set_fabrics_total(frm)
	},
	fabrics_remove(frm){
		set_fabrics_total(frm)
	}
});


frappe.ui.form.on('Job Costing Accessory', {
	qty(frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
		set_accessories_total(frm)
	},
	rate(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
		set_accessories_total(frm)	

	}
});


function set_fabrics_total(frm){
	var fabrics = frm.doc.fabrics;
	var fabrics_total = 0;
	for (var i in fabrics){
		fabrics_total += fabrics[i].amount
	}
	frm.set_value("fabrics_total", fabrics_total)
	frm.set_value("fabric_cost", fabrics_total)
}

function set_accessories_total(frm){
	var accessories = frm.doc.accessories;
	var accessories_total = 0;
	for (var i in accessories){
		accessories_total += accessories[i].amount
	}
	frm.set_value("accessories_total", accessories_total)
	frm.set_value("trims_and_accessories_cost", accessories_total)
}


