class Remark {
	constructor() {
		window.remark_config = {
			host: "https://remark.trashbird.gay",
			site_id: "Domak",
			components: ["embed", "last-comments"],
			max_shown_comments: 100,
			theme: "light",
			page_title: "",
			locale: "en",
			show_email_subscription: false,
			simple_view: true,
			no_footer: true,
		};
		var script = document.createElement("script");
		script.innerText = `!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);`;
		document.body.appendChild(script);
	}

	update_language() {
		//this._write_page();
	}
}

const remark = new Remark();
gloomlet_scripts.push(remark);
