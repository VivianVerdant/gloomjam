class Remark {
	constructor() {
		window.remark_config = {
			host: "https://remark.trashbird.gay",
			site_id: "Domak",
			name: "comments",
			components: ["embed", "last-comments"],
			max_shown_comments: 20,
			theme: "light",
			show_email_subscription: false,
			simple_view: true,
			no_footer: true,
		};
		window.remark_config.locale = localStorage.language;
		if (window.current_page) {
			window.remark_config.url = window.current_page.identifier;
		} else {
			setTimeout(() => {
				window.remark_config.url = window.current_page.identifier;
				this.update_page();
			}, 200);
		}
		this.create_iframe();
		//var script = document.createElement("script");
		//script.innerText = `!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);`;
		//document.body.appendChild(script);
	}

	create_iframe() {
		//console.log(window.remark_config);
		for (const component of remark_config.components) {
			let script = document.createElement("script"),
				root = document.head || document.body;
			script.type = "module";
			script.src = remark_config.host + "/web/" + component + ".mjs";
			root.appendChild(script);
		}
	}

	update_language() {
		window.REMARK42.destroy();
		window.remark_config.locale = localStorage.language;
		window.REMARK42.createInstance(window.remark_config);
	}

	update_page() {
		window.REMARK42.destroy();
		window.remark_config.url = window.current_page.identifier;
		window.REMARK42.createInstance(window.remark_config);
	}
}

const remark = new Remark();
gloomlet_scripts.push(remark);
