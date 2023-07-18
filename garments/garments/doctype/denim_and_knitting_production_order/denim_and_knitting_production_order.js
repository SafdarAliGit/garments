// Copyright (c) 2022, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Denim and Knitting Production Order', {
/*	
	sales_order(frm) {
		frm.doc.style = ""
		frm.refresh_field("style")
		
	},
*/
	style(frm){

	},
	qty(frm){
		frm.trigger("job_costing")
	},
	job_costing(frm){
		frappe.call({
			method:"set_materials",
			doc:frm.doc,
			callback(r){
				frm.refresh_field("materials")
			}
		})
	}
});


frappe.ui.form.on('Denim Production Order Raw Material', {
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	rate(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	materials_remove(frm, cdt, cdn){
		set_totals(frm, cdt, cdn)
	},

})


function set_amount(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "amount", d.qty* d.rate)
	set_totals(frm)
}

function set_totals(frm){
	frm.doc.total_raw_material_cost = 0;
	for(var i in frm.doc.materials){
		frm.doc.total_raw_material_cost += frm.doc.materials[i].amount
	}
	frm.refresh_field("total_raw_material_cost")
	frm.set_value("total_cost_of_denim_production_order", frm.doc.total_raw_material_cost + frm.doc.total_operation_cost)
	frm.set_value("difference", frm.doc.total_cost_of_denim_production_order - frm.doc.job_costing_total_cost_in_pkr)

}

/*
cur_frm.set_query("sales_order", function(){
	return{
		filters:{
			"docstatus" :1
		}
	}
})
*/

/*
cur_frm.set_query("style", function(){
	return{
		filters:{
			"item_group": "Raw Material",
			"is_stock_item":1
		}
	}
})
*/


