// Copyright (c) 2021, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Service Order', {
	refresh: function(frm) {
		if(frm.doc.docstatus == 1){
			frm.add_custom_button("Create Customer Invoice", function(){
				frappe.call({
					method:"create_invoice",
					doc: frm.doc,
					callback: function(r){
						frappe.set_route("Form", "Sales Invoice", r.message)
					}
				})
			})
			if(frm.doc.received < 100){
				frm.add_custom_button("Receive Material", function(){
					frappe.call({
						method:"receive_material",
						doc: frm.doc,
						callback: function(r){
							frappe.set_route("Form", "Stock Entry", r.message)
						}
					})
				})
			}
			if(frm.doc.received > 0 && frm.doc.delivered < 100 && frm.doc.received != frm.doc.delivered){
				frm.add_custom_button("Process Item", function(){
					frappe.prompt([
						{
							label: 'Item Code',
							fieldtype: 'Link',
							fieldname: 'item_code',
							options: "Item",
							default: cur_frm.doc.customer_items[0].item_code,
							get_query() {
					        	var items = [];
					        	var mat = cur_frm.doc.customer_items;
					        	for(var i in mat){
					        		items[i] = mat[i].item_code
					        	}
								return{
									filters:[
										 ["Item", "name", "in", items]
									]
								}
							}	
						},
						{
							label: 'Total Qty',
							fieldtype: 'Float',
							fieldname: 'qty',
							read_only: 1,
							default: cur_frm.doc.customer_items[0].qty
						},
						{
							label: 'Qty Processed',
							fieldtype: 'Float',
							fieldname: 'qty_processed',
							read_only: 1,
							default: cur_frm.doc.customer_items[0].qty_processed
						},
						{
							label: 'Qty to Process',
							fieldtype: 'Float',
							fieldname: 'qty_to_process',
							reqd: 1,
							default: cur_frm.doc.customer_items[0].qty - cur_frm.doc.customer_items[0].qty_processed
						}
					],  
					(values) => {
						if (values.qty_to_process <= (values.qty - (values.qty_processed || 0))){
						    frappe.call({
								method: "process_item",
								doc: frm.doc,
								args:{
									item_code:values.item_code,
									qty: values.qty,
									qty_processed: values.qty_to_process
								},
								callback: function(r){
									frappe.set_route("Form", "Stock Entry", r.message)
								}
							});
						}
						else{
							frappe.throw("Qty to Process can not be greater than " + (values.qty - (values.qty_processed || 0)))
						}
					})
				})
			}
			if(frm.doc.received > 0 && frm.doc.processed <= 100 && frm.doc.processed != frm.doc.delivered){
				frm.add_custom_button("Deliver Material", function(){
					frappe.call({
						method:"deliver_material",
						doc: frm.doc,
						callback: function(r){
							frappe.set_route("Form", "Stock Entry", r.message)
						}
					})
				})
			}
			frm.add_custom_button("Create Supplier Invoice", function(){
				frappe.prompt([
					{
						label: 'Supplier',
						fieldtype: 'Link',
						fieldname: 'supplier',
						options: "Supplier",
						reqd: 1,
						get_query() {
				        	var items = [];
				        	var mat = cur_frm.doc.processes;
				        	for(var i in mat){
				        		items[i] = mat[i].supplier
				        	}
							return{
								filters:[
									 ["Supplier", "name", "in", items]
								]
							}
						}	
					}
				],  
				(values) => {
				    frappe.call({
						method: "create_supplier_inv",
						doc: frm.doc,
						args:{
							supplier: values.supplier
						},
						callback: function(r){
							frappe.set_route("Form", "Purchase Invoice", r.message)
						}
					});
				})
			})
		}

		
	},
	commission_rate(frm){
		set_com_amount(frm);
	},
	commission_amount(frm){
		set_com_rate(frm);
	},
});


frappe.ui.form.on("Service Order Item", {
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	rate(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	items_remove(frm){
		set_total(frm);
	}
})

function set_amount(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate);
	set_total(frm);
}


function set_total(frm){
	var total_amount = 0;
	for(var i in frm.doc.items){
		total_amount += frm.doc.items[i].amount
	}
	frm.set_value("total_amount", total_amount)
	set_com_amount(frm);
}

function set_com_amount(frm) {
	
	frm.doc.commission_amount = (frm.doc.total_amount * frm.doc.commission_rate) / 100
	frm.refresh_field("commission_amount")
}



function set_com_rate(frm) {
	
	frm.doc.commission_rate = ( frm.doc.commission_amount / frm.doc.total_amount) * 100
	frm.refresh_field("commission_rate")
}


frappe.ui.form.on("Service Order Back Process", {
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	},
	rate(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	}
})













cur_frm.set_query("item_code", "items", function(){
	return{
		filters:{
			item_group:"Services"
		}
	}
})

cur_frm.set_query("item_code", "customer_items", function(){
	return{
		filters:{
			item_group:"Customer Provided Item"
		}
	}
})

cur_frm.set_query("item_code", "consumables", function(){
	return{
		filters:{
			item_group:"Chemical"
		}
	}
})

cur_frm.set_query("item_code", "processes", function(){
	return{
		filters:{
			item_group:"Services"
		}
	}
})

cur_frm.set_query("supplier", "processes", function(){
	return{
		filters:{
			supplier_group:"Services"
		}
	}
})