frappe.ui.form.on("Knitting Costing Sheet", {
	gsm(frm){
		frm.set_value("body_gross", frm.doc.gsm/frm.doc.constant*frm.doc.body_length * frm.doc.chest_bust)
		frm.trigger("sleeve_length")
	},
	constant(frm){
		frm.trigger("gsm")
	},
	body_length(frm){
		frm.trigger("gsm")
	},
	chest_bust(frm){
		frm.trigger("gsm")
	},
	sleeve_length(frm){
		frm.set_value("sleeve_gross", frm.doc.gsm/frm.doc.constant * frm.doc.sleeve_length * frm.doc.sleeve_width * 2)
		frm.set_value("total_body_gross", frm.doc.body_gross + frm.doc.sleeve_gross)
		frm.set_value("rib", frm.doc.total_body_gross * 0.15)
	},
	sleeve_width(frm){
		frm.trigger("sleeve_length")
	},
	master_gross(frm){
		frm.set_value("wastage_master", frm.doc.master_gross*0.15)
		frm.trigger("total_fabric_cost")
	},
	yarn_per_kg(frm){
		
		frm.set_value("total_fabric_cost", frm.doc.yarn_per_kg+frm.doc.dyeing+frm.doc.knitting+frm.doc.rotery+frm.doc.pigment_garment_dye)
	},
	dyeing(frm){
		frm.trigger("yarn_per_kg")
	},
	knitting(frm){
		frm.trigger("yarn_per_kg")
	},
	rotery(frm){
		frm.trigger("yarn_per_kg")
	},
	pigment_germent_dye(frm){
		frm.trigger("yarn_per_kg")
	},
	total_fabric_cost(frm){
		frm.set_value("consumption", frm.doc.master_gross * frm.doc.total_fabric_cost)
	},
	consumption(frm){
		var f = frm.doc;
		frm.set_value("net_total", f.consumption+f.cut_to_pack+f.trims+f.thread+f.polybag+f.carton+f.finishing_trims+f.main_label+f.size_label+f.care_label+f.hang_tag+f.elastic+f.chord+f.piping+f.buttons+f.hangerloops+f.testing+f.sampling+f.hanger+f.attach_loop+f.embalishment+f.print+f.embroidery+f.zip+f.lining+f.entertainment + f.wastage)
	},
	cut_to_pack(frm){
		frm.trigger("consumption")
	},
	trims(frm){
		frm.trigger("consumption")
	},
	thread(frm){
		frm.trigger("consumption")
	},
	polybag(frm){
		frm.trigger("consumption")
	},
	carton(frm){
		frm.trigger("consumption")
	},
	finishing_trims(frm){
		frm.trigger("consumption")
	},
	main_label(frm){
		frm.trigger("consumption")
	},
	size_label(frm){
		frm.trigger("consumption")
	},
	care_label(frm){
		frm.trigger("consumption")
	},
	hang_tag(frm){
		frm.trigger("consumption")
	},
	hanger(frm){
		frm.trigger("consumption")
	},
	attach_loop(frm){
		frm.trigger("consumption")
	},
	embalishment(frm){
		frm.trigger("consumption")
	},
	print(frm){
		frm.trigger("consumption")
	},
	embroidery(frm){
		frm.trigger("consumption")
	},
	zip(frm){
		frm.trigger("consumption")
	},
	lining(frm){
		frm.trigger("consumption")
	},
	elastic(frm){
		frm.trigger("consumption")
	},
	chord(frm){
		frm.trigger("consumption")
	},
	piping(frm){
		frm.trigger("consumption")
	},
	buttons(frm){
		frm.trigger("consumption")
	},
	hangerloops(frm){
		frm.trigger("consumption")
	},
	testing(frm){
		frm.trigger("consumption")
	},
	sampling(frm){
		frm.trigger("consumption")
	},
	entertainment(frm){
		frm.trigger("consumption")
	},
	 wastage(frm){
		frm.trigger("consumption")
	},
	net_total(frm){
		frm.set_value("commision", frm.doc.net_total * 0.04)
		frm.set_value("total", frm.doc.net_total+frm.doc.commision)
	},
	total(frm){
		frm.set_value("per_piece_pkr", frm.doc.total/frm.doc.qty)
		frm.set_value("per_piece_usd", frm.doc.per_piece_pkr / frm.doc.exr)
	},
	qty(frm){
		frm.trigger("total")
	},
	exr(frm){
		frm.trigger("total")
	}
})