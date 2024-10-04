import frappe


@frappe.whitelist()
def get_subcontracting_items(**args):
    import json

    # Get invoice IDs from args
    names = args.get('names')

    # Validate input and ensure 'names' is present
    if not names:
        frappe.throw("No invoice IDs provided.")

    # Ensure names is a list (convert JSON string if necessary)
    try:
        ids = json.loads(names)  # Parse the JSON string
    except (TypeError, json.JSONDecodeError):
        frappe.throw("Invalid data format for names. It should be a valid JSON list.")

    # Ensure ids is a list and not empty
    if not ids:
        frappe.throw("The list of invoice IDs is empty or not valid.")

    # Convert the list to a tuple for SQL query
    ids_tuple = tuple(ids)

    # # Fetch items from Subcontracting Receipt Item where conditions are met
    scr_items = frappe.db.sql(
        """
        SELECT scr_item.item_code, scr_item.description, scr_item.qty,
               scr_item.rate, scr_item.amount, scr_item.name,
               scr_item.cost_center,
               scr_item.parent AS receipt_document,
               scr_item.warehouse
        FROM `tabSubcontracting Receipt Item` scr_item
        WHERE scr_item.parent IN %s
        AND EXISTS (
            SELECT name
            FROM `tabItem`
            WHERE name = scr_item.item_code
            AND (is_stock_item = 1 OR is_fixed_asset = 1)
        )
        """, (ids_tuple,), as_dict=True
    )

    # Return the items if found, else throw an error
    if scr_items:
        return scr_items
    else:
        frappe.throw(f"No valid items found for Subcontracting Receipts {ids_tuple}.")
