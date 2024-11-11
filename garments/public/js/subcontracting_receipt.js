frappe.ui.form.on("Subcontracting Receipt", {
    refresh: function (frm) {
        if (!frm.doc.__islocal && frm.doc.docstatus == 1) { // Only show the button if the document is submitted
            frm.add_custom_button(__('Create Purchase Receipt'), function () {
                create_purchase_receipt(frm);
            }, __('Create'));
        }
    }

});

function create_purchase_receipt(frm) {
    // Retrieve values
    let subcontracting_order = frm.doc.items[0].subcontracting_order;
    let master_towel_costing = frm.doc.master_towel_costing;
    let supplier = frm.doc.supplier;
    let scr = frm.doc.name;

    // Check if any argument is missing
    let missing_fields = [];
    if (!subcontracting_order) missing_fields.push("Subcontracting Order");
    if (!master_towel_costing) missing_fields.push("Master Towel Costing");
    if (!supplier) missing_fields.push("Supplier");
    if (!scr) missing_fields.push("Subcontracting Order No");

    // If there are missing fields, show an error message
    if (missing_fields.length > 0) {
        frappe.msgprint({
            title: __('Missing Information'),
            message: __('The following fields are required: ') + missing_fields.join(", "),
            indicator: 'red'
        });
        return; // Stop execution if there are missing fields
    } else {
        frappe.call({
            method: 'garments.garments.doctype.util.create_purchase_receipt.create_purchase_receipt',
            args: {
                'sco_name': subcontracting_order,
                'master_towel_costing': master_towel_costing,
                'supplier': supplier,
                'scr': scr
            },
            callback: function (r) {
                if (!r.exc) {
                    frappe.model.sync(r.message);
                    frappe.set_route("Form", r.message.doctype, r.message.name);
                }
            }
        });
    }

    // Proceed with the frappe.call if all required fields are present

}

