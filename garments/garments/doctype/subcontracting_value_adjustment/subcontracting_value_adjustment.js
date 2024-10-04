// Copyright (c) 2024, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Subcontracting Value Adjustment', {
    refresh: function (frm) {

        frm.set_query('expense_account', 'taxes', function (doc, cdt, cdn) {
            return {
                filters: {
                    account_type: "Chargeable"
                }
            };
        });


    },
    get_items_from_subcontracting_receipts: function (frm) {
        get_scr_names(frm);  // Assuming this function populates scr_names correctly

        if (scr_names.length < 1) {
            frappe.msgprint(__("Please enter Subcontracting Receipt first"));
        } else {

            frappe.call({
                method: "garments.garments.doctype.util.get_subcontracting_items.get_subcontracting_items",
                args: {
                    names: scr_names // Convert array to JSON string before passing
                },
                callback: function (response) {
                    if (response.message) {
                        // Clear the existing items table if needed
                        frm.clear_table("items");

                        // Iterate through the fetched data and add rows to the child table
                        response.message.forEach(item => {
                            let child = frm.add_child("items");

                            // Populate child fields with values from the fetched data
                            frappe.model.set_value(child.doctype, child.name, "item_code", item.item_code);
                            frappe.model.set_value(child.doctype, child.name, "description", item.description);
                            frappe.model.set_value(child.doctype, child.name, "qty", item.qty);
                            frappe.model.set_value(child.doctype, child.name, "rate", item.rate);
                            frappe.model.set_value(child.doctype, child.name, "amount", item.amount);
                            frappe.model.set_value(child.doctype, child.name, "cost_center", item.cost_center);
                            frappe.model.set_value(child.doctype, child.name, "receipt_document", item.receipt_document);
                            frappe.model.set_value(child.doctype, child.name, "warehouse", item.warehouse);
                            frappe.model.set_value(child.doctype, child.name, "receipt_child_id", item.name);
                        });

                        // Refresh the field to show the updated child table
                        frm.refresh_field("items");
                        set_total_qty(frm);
                    }
                }
            });
        }
    }

});


frappe.ui.form.on('Subcontracting Receipt Item Adjustment', {
    receipt_document: function (frm, cdt, cdn) {
        // Get the row in the child table
        let row = locals[cdt][cdn];

        if (row.receipt_document) {
            frappe.call({
                method: "garments.garments.doctype.util.get_subcontracting_info.get_subcontracting_info", args: {
                    name: row.receipt_document
                }, callback: function (response) {
                    if (response.message) {
                        // Set the supplier and grand_total values to the child table
                        frappe.model.set_value(cdt, cdn, 'supplier', response.message.supplier);
                        frappe.model.set_value(cdt, cdn, 'grand_total', response.message.total);
                    }
                }
            });
        }
    }

});

frappe.ui.form.on('Subcontracting Taxes and Charges Adjustment', {
    amount: function (frm, cdt, cdn) {
        set_total_taxes_and_charges(frm);
    }
});

function set_total_taxes_and_charges(frm) {
    var total_taxes_and_charges = 0.0;
    $.each(frm.doc.taxes || [], function (i, d) {
        total_taxes_and_charges += flt(d.amount);
    });
    frm.set_value("total_taxes_and_charges", total_taxes_and_charges);
}

function set_total_qty(frm) {
    var total_qty = 0.0;
    $.each(frm.doc.items || [], function (i, d) {
        total_qty += flt(d.qty);
    });
    frm.set_value("total_qty", total_qty);
}

let scr_names = [];

function get_scr_names(frm) {
    scr_names = []; // Reset the array

    $.each(frm.doc.subcontracting_receipts || [], function (index, row) {
        if (row.receipt_document) {
            scr_names.push(row.receipt_document);
        }
    });
}