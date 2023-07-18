// Copyright (c) 2022, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Towel Costing Sheet', {
	
	before_save: function(frm){
		if (frm.doc.total_ratio != 100){
			frappe.validated = false
			frappe.throw("Total Ratio must be equal to 100.")
		}
	},
	width: function(frm) {
		frm.set_value("weight", frm.doc.width * frm.doc.length * frm.doc.gsm / 10000)
	},
	length(frm){
		frm.trigger("width")
	},
	gsm(frm){
		frm.trigger("width")
	},
	weight(frm){
		frm.set_value("total_weight", frm.doc.weight * frm.doc.qty/1000)
		frm.set_value("towels_per_kg", 1000/frm.doc.weight)
		frm.trigger("fc_rskg")
	},
	qty(frm){
		frm.trigger("weight")
		frm.set_value("stitching_cost_total", frm.doc.stitching_cost_per_piece * frm.doc.qty)
		frm.set_value("accessories_cost_total", frm.doc.accessories_per_piece * frm.doc.qty)
	},
	total_weight(frm){
		frm.set_value("weight_with", (frm.doc.total_weight * frm.doc.wastage/100) + frm.doc.total_weight)
		frm.trigger("cnf_charges_per_kg")
	},
	total_cost(frm){
		frm.trigger("wastage_cost")
	},
	weight_with(frm){
		set_yarn_weight_in_all(frm)
		
	},
	stitching_cost_per_piece(frm){
		frm.set_value("stitching_cost_per_kg", frm.doc.stitching_cost_per_piece * frm.doc.towels_per_kg)
		frm.set_value("stitching_cost_price_per_piece", frm.doc.stitching_cost_per_piece)
		frm.set_value("stitching_cost_price_per_kg", frm.doc.stitching_cost_per_kg)
		frm.set_value("stitching_cost_total", frm.doc.stitching_cost_per_piece * frm.doc.qty)
		frm.trigger("towel_cost_with_dyeing_price_per_piece")
	},
	accessories_per_piece(frm){
		frm.set_value("accessories_per_kg", frm.doc.accessories_per_piece * frm.doc.towels_per_kg)
		frm.set_value("accessories_price_per_piece", frm.doc.accessories_per_piece)
		frm.set_value("accessories_price_per_kg", frm.doc.accessories_per_kg)
		
		frm.set_value("accessories_cost_total", frm.doc.accessories_per_piece * frm.doc.qty)
		frm.trigger("towel_cost_with_dyeing_price_per_piece")
	},
	wastage_per_piece(frm){
		frm.trigger("towel_cost_with_dyeing_price_per_piece")
		
	},
	wastage_per_kg(frm){
		
		frm.trigger("towel_cost_with_dyeing_price_per_kg")
	},

	wastage(frm){
		frm.trigger("total_weight")
		frm.set_value("wastage_cost", frm.doc.total_cost * (frm.doc.wastage/(100-frm.doc.wastage)))
	},
	wastage_cost(frm){
		frm.set_value("total_yarn_cost_wastage", frm.doc.wastage_cost + frm.doc.total_cost)
	},
	
	dyeing(frm){
		frm.set_value("dyed_fabric_cost_lbs", frm.doc.dyeing + frm.doc.total_yarn_cost_wastage + frm.doc.weaving_oh)
		frm.set_value("dyeing_cost_total", frm.doc.total_weight * frm.doc.dyeing * 2.2046)
	},
	total_yarn_cost_wastage(frm){
		frm.trigger("dyeing")
	},
	stiching_wastage_perc(frm){
		frm.set_value("wastage_per_kg",(frm.doc.fc_rskg + frm.doc.stitching_cost_per_kg + frm.doc.accessories_price_per_kg) / (100 - frm.doc.stiching_wastage_perc) * frm.doc.stiching_wastage_perc);
		frm.set_value("wastage_per_piece",(((frm.doc.fc_rskg * frm.doc.weight)/1000) + frm.doc.stitching_cost_per_piece + frm.doc.accessories_per_piece ) /(100 - frm.doc.stiching_wastage_perc) * frm.doc.stiching_wastage_perc);

		// frm.set_value("total_cogs_per_kg",frm.doc.fc_rskg + frm.doc.stitching_cost_per_kg + frm.doc.accessories_price_per_kg + frm.doc.wastage_per_kg + frm.doc.cnf_charges_per_kg);
		// frm.set_value("total_cogs_per_piece",(frm.doc.fc_rskg * frm.doc.weight)/1000 + frm.doc.stitching_cost_price_per_piece + frm.doc.accessories_per_piece + frm.doc.cnf_charges_per_piece);
	},
	bank_oh_profit_perc(frm) {
		frm.set_value("bank_oh_profit_price_per_kg",(frm.doc.total_cogs_per_kg /(100 - frm.doc.bank_oh_profit_perc)) * frm.doc.bank_oh_profit_perc);
		frm.set_value("bank_oh_profit_price_per_piece",(frm.doc.total_cogs_per_piece /(100 - frm.doc.bank_oh_profit_perc)) * frm.doc.bank_oh_profit_perc);
	},
	exchange_rate_for_cf(frm) {
		frm.set_value("container_clearing_amount_in_rs", frm.doc.exchange_rate_for_cf * frm.doc.container_freight_usd + frm.doc.clearing_amount);
	},
	total_kgs_in_container(frm) {
		frm.set_value("cnf_charges_per_kg", frm.doc.container_clearing_amount_in_rs / frm.doc.total_kgs_in_container);
		frm.set_value("cnf_charges_per_piece", (frm.doc.cnf_charges_per_kg * frm.doc.weight) / 1000);
	},
	container_freight_usd(frm) {
		frm.trigger("exchange_rate_for_cf")
	},
	clearing_amount(frm) {
		frm.trigger("exchange_rate_for_cf")
	},

	weaving_oh(frm){
		frm.set_value("weaving_oh_cost_total", frm.doc.total_weight * frm.doc.weaving_oh * 2.2046)
		frm.trigger("dyeing")
	},
	dyed_fabric_cost_lbs(frm){
		frm.set_value("fc_rskg", frm.doc.dyed_fabric_cost_lbs * 2.2046)
	},
	fc_rskg(frm){
		frm.set_value("towel_cost_with_dyeing_price_per_piece", frm.doc.fc_rskg * frm.doc.weight / 1000)
		frm.set_value("towel_cost_with_dyeing_price_per_kg", frm.doc.fc_rskg)
	},
	towel_cost_with_dyeing_price_per_piece(frm){
		frm.set_value("b_wastage_price_per_piece", ((frm.doc.towel_cost_with_dyeing_price_per_piece + frm.doc.stitching_cost_price_per_piece + frm.doc.accessories_price_per_piece)/ (100-frm.doc.wastage_per_piece))*frm.doc.wastage_per_piece)
		
		frm.trigger("towel_cost_with_dyeing_price_per_kg")
		frm.trigger("clearing_freight_price_per_piece")
		
	},
	towel_cost_with_dyeing_price_per_kg(frm){
		frm.set_value("b_wastage_price_per_kg", ((frm.doc.towel_cost_with_dyeing_price_per_kg + frm.doc.stitching_cost_price_per_kg + frm.doc.accessories_price_per_kg)/ (100-frm.doc.wastage_per_kg))*frm.doc.wastage_per_kg)
		frm.trigger("clearing_freight_price_per_kg")
	},
	container_freight_charges_per_piece(frm){
		frm.set_value("clearing_freight_price_per_piece", frm.doc.container_freight_charges_per_piece * frm.doc.weight / 1000)
	},
	container_freight_charges_per_kg(frm){
		frm.set_value("clearing_freight_price_per_kg", frm.doc.container_freight_charges_per_kg)
	},
	clearing_freight_price_per_kg(frm){
		frm.set_value("clearing_freight_total", frm.doc.total_weight * frm.doc.clearing_freight_price_per_kg/1000)
	},
	cnf_charges_per_piece(frm){
		frm.set_value("total_cogs_price_per_piece", (frm.doc.fc_rskg * frm.doc.weight)/1000 + frm.doc.stitching_cost_price_per_piece +frm.doc.accessories_price_per_piece + frm.doc.cnf_charges_per_piece + frm.doc.wastage_per_piece)
	},
	cnf_charges_per_kg(frm){
		frm.set_value("total_cogs_price_per_kg", frm.doc.fc_rskg + frm.doc.stitching_cost_per_kg + frm.doc.accessories_price_per_kg + frm.doc.wastage_per_kg + frm.doc.cnf_charges_per_kg)
		frm.set_value("clearing_freight_total", frm.doc.cnf_charges_per_kg * frm.doc.total_weight)
	},
	total_cogs_price_per_piece(frm){
		frm.set_value("bank_oh_profit_price_per_piece", (frm.doc.total_cogs_price_per_piece /(100-frm.doc.bank_oh_profit_perc))*frm.doc.bank_oh_profit_perc)
	},
	total_cogs_price_per_kg(frm){
		frm.set_value("bank_oh_profit_price_per_kg", (frm.doc.total_cogs_price_per_kg /(100-frm.doc.bank_oh_profit_perc))*frm.doc.bank_oh_profit_perc)
	},
	bank_oh_profit_per_piece(frm){
		frm.trigger("total_cogs_price_per_piece")
	},
	bank_oh_profit_per_kg(frm){
		frm.trigger("total_cogs_price_per_kg")
	},
	bank_oh_profit_price_per_piece(frm){
		frm.set_value("total_price_in_pkr_price_per_piece", frm.doc.bank_oh_profit_price_per_piece + frm.doc.total_cogs_price_per_piece)
	},
	bank_oh_profit_price_per_kg(frm){
		frm.set_value("total_price_in_pkr_price_per_kg", frm.doc.bank_oh_profit_price_per_kg + frm.doc.total_cogs_price_per_kg)
	},
	total_price_in_pkr_price_per_piece(frm){
		frm.set_value("price_in_usd_price_per_piece", frm.doc.total_price_in_pkr_price_per_piece / frm.doc.exchange_rate_for_sale_price)
	},
	total_price_in_pkr_price_per_kg(frm){
		frm.set_value("price_in_usd_price_per_kg", frm.doc.total_price_in_pkr_price_per_kg / frm.doc.exchange_rate_for_sale_price)
	},
	exchange_rate_per_piece(frm){
		frm.trigger("total_price_in_pkr_price_per_piece")
	},
	exchange_rate_per_kg(frm){
		frm.trigger("total_price_in_pkr_price_per_kg")
	},
	yarn_cost_total(frm){
		frm.set_value("grand_total_cost", frm.doc.yarn_cost_total + frm.doc.weaving_oh_cost_total + frm.doc.dyeing_cost_total + frm.doc.accessories_cost_total + frm.doc.stitching_cost_total + frm.doc.clearing_freight_total)
	},
	weaving_oh_cost_total(frm){
		frm.trigger("yarn_cost_total")
	},
	dyeing_cost_total(frm){
		frm.trigger("yarn_cost_total")
	},
	accessories_cost_total(frm){
		frm.trigger("yarn_cost_total")
	},
	stitching_cost_total(frm){
		frm.trigger("yarn_cost_total")
	},
	clearing_freight_total(frm){
		frm.trigger("yarn_cost_total")
	}
});

frappe.ui.form.on("Towel Costing Sheet Raw Material", {
	price(frm, cdt, cdn){
		set_cost(frm, cdt, cdn)
	},
	yard_required_in_lbs(frm, cdt, cdn){
		set_cost(frm, cdt, cdn)
	},
	materials_remove(frm){
		set_totals(frm)
	},
	ratio(frm, cdt, cdn){
		set_yarn_weight(frm, cdt, cdn)
	}
})

function set_cost(frm, cdt, cdn){
	var d = locals[cdt][cdn]
	frappe.model.set_value(d.doctype, d.name, "cost", d.price * d.yarn_required_in_lbs)
	set_totals(frm)
}

function set_totals(frm){
	frm.doc.total_ratio = 0
	frm.doc.total_cost = 0
	frm.doc.yarn_cost_total = 0
	for(var m in frm.doc.materials){
		frm.doc.total_ratio += frm.doc.materials[m].ratio
		frm.doc.yarn_cost_total += frm.doc.materials[m].cost
		frm.doc.total_cost += frm.doc.materials[m].price * frm.doc.materials[m].ratio/100
	}
	frm.refresh_fields(['total_cost', 'total_ratio', 'yarn_cost_total'])
	frm.trigger("wastage")
	frm.trigger("yarn_cost_total")
}

function set_yarn_weight(frm, cdt, cdn){
	var d = locals[cdt][cdn]
	frappe.model.set_value(d.doctype, d.name, "yarn_required_in_lbs", 2.2046*frm.doc.weight_with *(d.ratio/100))
	frappe.model.set_value(d.doctype, d.name, "bags_reqd", d.yarn_required_in_lbs/100)
	set_cost(frm, cdt, cdn)
}

function set_yarn_weight_in_all(frm){
	for(let i in frm.doc.materials){
		let d = frm.doc.materials[i]
		d.yarn_required_in_lbs = 2.2046*frm.doc.weight_with *(d.ratio/100)
		d.cost = d.price * d.yarn_required_in_lbs
		d.bags_reqd = d.yarn_required_in_lbs/100
	}
	frm.refresh_field("materials")
	set_totals(frm)
}
