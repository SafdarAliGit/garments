// Copyright (c) 2022, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Denim Operation', {
	denim_and_knitting_production_order(frm) {
		frappe.call({
			method:"get_materials",
			doc:frm.doc,
			callback(r){
				frm.refresh_field("materials")
				set_totals(frm)
			}
		})
	},
	source_warehouse(frm){
		//frm.trigger("denim_and_knitting_production_order")
	},
	finished_qty(frm){
		set_totals(frm)
	}
});



frappe.ui.form.on('Denim Operation Raw Material', {
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	rate(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	materials_remove(frm, cdt, cdn){
		set_totals(frm, cdt, cdn)
	},
	item_code(frm, cdt, cdn) {
		//get_rates(frm, cdt, cdn);
	    var d = locals[cdt][cdn];
		if (d.item_code){
			frappe.call({
				"method": "erpnext.stock.utils.get_stock_balance",
				args:{
					item_code: d.item_code,
					warehouse: frm.doc.source_warehouse,
					with_valuation_rate: "True"
				},
				callback(r){
					frappe.model.set_value(d.doctype, d.name, "available_qty", r.message[0])
					frappe.model.set_value(d.doctype, d.name, "rate", r.message[1])
				}
			})
		}
		else{
			frappe.model.set_value(d.doctype, d.name, "available_qty", 0)
		}	
	}
})


function get_rates(frm, cdt, cdn){
	var d = locals[cdt][cdn]
	if (d.item_code){
		frappe.call({
			method:"get_last_purchase_rate",
			doc:frm.doc,
			args:{
				"item_code":d.item_code
			},
			callback(r){
				frappe.model.set_value(d.doctype, d.name, "rate", r.message)
				frappe.model.set_value(d.doctype, d.name, "amount", r.qty * r.message)
			}
		})
	}
	else{
		frappe.model.set_value(d.doctype, d.name, "rate", 0)
		frappe.model.set_value(d.doctype, d.name, "amount", 0)
	}
	
}

frappe.ui.form.on('Denim Operation Expense', {
	amount(frm, cdt, cdn){
		set_totals(frm, cdt, cdn)
	},
	expenses_remove(frm, cdt, cdn){
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
	frm.doc.total_expenses = 0;
	for(var i in frm.doc.materials){
		frm.doc.total_raw_material_cost += frm.doc.materials[i].amount
	}
	
	for(var i in frm.doc.expenses){
		frm.doc.total_expenses += frm.doc.expenses[i].amount
	}
	frm.refresh_field("total_raw_material_cost")
	frm.refresh_field("total_expenses")

	frm.set_value("total_cost", frm.doc.total_raw_material_cost + frm.doc.total_expenses)
	frm.set_value("total_cost_per_piece", frm.doc.total_cost / frm.doc.finished_qty)
	

}

