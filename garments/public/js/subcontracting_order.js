frappe.ui.form.on("Subcontracting Order", {
    refresh: function (frm) {
        calculate_totals(frm);
    },
    on_submit: function (frm) {
        calculate_totals(frm);
    },
    onload: function (frm) {
        calculate_totals(frm);
    }

});


    
function calculate_totals(frm) {
    let total_supplied_qty = 0;
    let total_consumed_qty = 0;
    let total_returned_qty = 0;

    frm.doc.supplied_items.forEach(function(row) {
        total_supplied_qty += row.supplied_qty || 0;
        total_consumed_qty += row.consumed_qty || 0;
        total_returned_qty += row.returned_qty || 0;
        if (row.required_qty > 0) {
            row.required_bags = row.required_qty/100;
        }
        
    });

    frm.set_value('total_supplied_qty', total_supplied_qty);
    frm.set_value('total_consumed_qty', total_consumed_qty);
    frm.set_value('total_returned_qty', total_returned_qty);
    frm.refresh_table('supplied_items');
}