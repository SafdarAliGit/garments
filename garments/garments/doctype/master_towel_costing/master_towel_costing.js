// Copyright (c) 2022, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Master Towel Costing', {
	refresh: function(frm){
		frm.add_custom_button("Create Purchase Order", function(){
			let d = new frappe.ui.Dialog({
                title: 'Enter purchase details',
                fields: [
                    {
                        label: 'Supplier',
                        fieldname: 'supplier',
                        fieldtype: 'Link',
                        options: "Supplier",
                        reqd: 1
                    }
                ],
                primary_action_label: 'Submit',
                primary_action(values) {
                    console.log(values);
                    frappe.call({
                        method: "create_po",
						doc:frm.doc,
                        args:{
                            
                            supplier: values.supplier
                        },
                        callback(r){
                            if(r.message == "Refresh"){
                                frm.reload_doc();
                            }
                            else{
                                frappe.set_route("purchase-order", r.message);
                            }
                        }
                    })
                    d.hide();
                }
            });
            
            d.show();
		})
        frm.add_custom_button("Create Material Request", function(){
			frappe.call({
                method: "create_mr",
                doc:frm.doc,
                args:{
                    //supplier: values.supplier
                },
                callback(r){
                    if(r.message == "Refresh"){
                        frm.reload_doc();
                    }
                    else{
                        frappe.set_route("material-request", r.message);
                    }
                }
            })
		})
	},
});
