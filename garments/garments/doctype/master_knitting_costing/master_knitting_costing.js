frappe.ui.form.on("Master Knitting Costing", {
	qty(frm){
		frm.set_value("qty_in_dzn", frm.doc.qty / 12)
		frm.set_value("cof_qty", frm.doc.qty_in_dzn)
		frm.set_value("ctp_qty", frm.doc.qty_in_dzn)
		frm.set_value("ctp_qty", frm.doc.qty_in_dzn)
		frm.set_value("oh_qty", frm.doc.qty_in_dzn)
		frm.set_value("p_qty", frm.doc.qty_in_dzn)
		frm.set_value("emb_qty", frm.doc.qty_in_dzn)
		frm.set_value("st_qty", frm.doc.qty_in_dzn)
		frm.set_value("ft_qty", frm.doc.qty_in_dzn)
		frm.set_value("c_qty", frm.doc.qty_in_dzn)
		frm.set_value("e_qty", frm.doc.qty_in_dzn)
	},
	fabric_price(frm){
		frm.trigger("qty")
		
		set_pp(frm)
	},
	total_fabric(frm){
		set_pp(frm)
	},
	qty_required(frm){
		frm.trigger("qty")
		frm.set_value("total_cost", frm.doc.qty_required * frm.doc.per_piece_amount)
	},
	cof_qty(frm){
		frm.set_value("cof_amount", frm.doc.cof_rate * frm.doc.cof_qty)
		set_pp(frm)
	},
	cof_rate(frm){
		frm.trigger("cof_qty")
	},
	ctp_qty(frm){
		frm.set_value("ctp_amount", frm.doc.ctp_rate * frm.doc.ctp_qty)
		set_pp(frm)
	},
	ctp_rate(frm){
		frm.trigger("ctp_qty")
	},
	oh_qty(frm){
		frm.set_value("oh_amount", frm.doc.oh_rate * frm.doc.oh_qty)
		set_pp(frm)
	},
	oh_rate(frm){
		frm.trigger("oh_qty")
	},
	p_qty(frm){
		frm.set_value("p_amount",  frm.doc.p_rate * frm.doc.p_qty)
		set_pp(frm)
	},
	p_rate(frm){
		frm.trigger("p_qty")
	},
	emb_qty(frm){
		frm.set_value("emb_amount",  frm.doc.emb_rate * frm.doc.emb_qty)
		set_pp(frm)
	},
	emb_rate(frm){
		frm.trigger("emb_qty")
	},
	st_qty(frm){
		frm.set_value("st_amount", frm.doc.st_rate * frm.doc.st_qty)
		set_pp(frm)
	},
	st_rate(frm){
		frm.trigger("st_qty")
	},
	ft_qty(frm){
		frm.set_value("ft_amount", frm.doc.ft_rate * frm.doc.ft_qty)
		set_pp(frm)
	},
	ft_rate(frm){
		frm.trigger("ft_qty")
	},
	c_qty(frm){
		frm.set_value("c_amount",  frm.doc.c_rate * frm.doc.c_qty)
		set_pp(frm)
	},
	c_rate(frm){
		frm.trigger("c_qty")

	},
	e_qty(frm){
		frm.set_value("e_amount",  frm.doc.e_rate * frm.doc.e_qty)
		set_pp(frm)
	},
	e_rate(frm){
		frm.trigger("e_qty")
	},
	yarn_per_kg(frm){
		frm.set_value("fabric_price", frm.doc.yarn_per_kg + frm.doc.rortary + frm.doc.dying_cost + frm.doc.knitting_cost)
		frm.set_value("cof_rate", frm.doc.fabric_price * frm.doc.total_fabric)
		
	},
	rortary(frm){
		frm.trigger("yarn_per_kg")
	},
	dying_cost(frm){
		frm.trigger("yarn_per_kg")
	},
	knitting_cost(frm){
		frm.trigger("yarn_per_kg")
	},
	per_piece_amount(frm){
		frm.set_value("per_piece_amount_in_usd", frm.doc.per_piece_amount / frm.doc.exchange_rate)
		frm.set_value("total_cost_in_usd", frm.doc.total_cost / frm.doc.exchange_rate)
	},
	total_cost(frm){
		frm.trigger("per_piece_amount")
	},
	exchange_rate(frm){
		frm.trigger("per_piece_amount")
	},


})

function set_pp(frm){
	frm.set_value("total_cost", frm.doc.cof_amount  + frm.doc.ctp_amount + frm.doc.oh_amount + frm.doc.p_amount + frm.doc.emb_amount + frm.doc.st_amount + frm.doc.ft_amount + frm.doc.c_amount + frm.doc.e_amount)
	frm.set_value("per_piece_amount", frm.doc.total_cost/frm.doc.qty )
}


frappe.ui.form.on("Master Knitting Costing Fabric", {
	width(frm, cdt, cdn){
		set_ftic(frm, cdt, cdn)
	},
	length(frm, cdt, cdn){
		set_ftic(frm, cdt, cdn)
	},
	no_of_pcs(frm, cdt, cdn){
		set_ftic(frm, cdt, cdn)
	},
	gsm(frm, cdt, cdn){
		set_ftic(frm, cdt, cdn)
	},
	before_fabrics_remove(frm, cdt, cdn){
		set_tf(frm)
	},
	fabric_type(frm, cdt, cdn){
		set_ftic(frm, cdt, cdn)
	},

})


function set_ftic(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var fr=(d.width*d.length*d.gsm/1000);
    if(d.fabric_type=="Tubler"){
        fr=fr*2;
    }
    fr = ((fr/1550)/d.no_of_pcs)*12
    fr = fr + (fr * 0.17)
    frappe.model.set_value(d.doctype, d.name, "total_fabric", fr);
	set_tf(frm);
}

function set_tf(frm){
	var fab = frm.doc.fabrics;
	frm.doc.total_fabric = 0;
	for(var i in fab){
		frm.doc.total_fabric += fab[i].total_fabric;
	}
	frm.refresh_field("total_fabric");

	
}

frappe.ui.form.on("MKC Yarn", {
	consumption(frm, cdt, cdn){
		set_yarn_amount(frm, cdt, cdn);
	},
	price(frm, cdt, cdn){
		set_yarn_amount(frm, cdt, cdn);
	},
	yarns_remove(frm){
		set_yarn_total(frm)
	},

})


function set_yarn_amount(frm, cdt, cdn){
	var d = locals[cdt][cdn]
	frappe.model.set_value(d.doctype, d.name, "amount", d.consumption*d.price/100)
	set_yarn_total(frm)
}

function set_yarn_total(frm){
	var yarns = frm.doc.yarns;
	frm.doc.total_yarn_amount = 0;
	for(var i in yarns){
		frm.doc.total_yarn_amount += yarns[i].amount
	}
	frm.refresh_field("total_yarn_amount")
	frm.set_value("yarn_per_kg", frm.doc.total_yarn_amount/45.36)
}

var vararr = ['cof', 'ctp']