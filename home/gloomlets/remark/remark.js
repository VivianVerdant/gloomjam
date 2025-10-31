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
		window.remark_config.url = window.current_page.identifier;
		var script = document.createElement("script");
		this.create_iframe();
		script.innerText = `!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);`;
		//document.body.appendChild(script);
	}

	create_iframe() {
		console.log(window.remark_config);
		for (const component of remark_config.components) {
			let script = document.createElement("script"),
				root = document.head || document.body;
			script.type = "module";
			script.src = remark_config.host + "/web/" + component + ".mjs";
			root.appendChild(script);
		}
	}

	update_language() {
		//window.REMARK42.destroy();
		window.remark_config.locale = localStorage.language;
		this.create_iframe();
	}

	update_page() {
		//window.REMARK42.destroy();
		window.remark_config.url = window.current_page.identifier;
		console.log(window.remark_config.url);
		this.create_iframe();
	}
}

const remark = new Remark();
gloomlet_scripts.push(remark);
/*
var MutationObserver =
	window.MutationObserver ||
	window.WebKitMutationObserver ||
	window.MozMutationObserver;
var observer = new MutationObserver(function (mutations) {
	if (mutations[0].type === "childList") {
		// optional

		if (document.querySelector("#remark42 iframe")) {
			console.log("iframe added to dom");

			var iframe = document.querySelector("#remark42 iframe");

			iframe.addEventListener("load", function (e) {
				console.log("iframe content loaded");

				// style iframe element
				// iframe.style.border = "5px solid aqua";

				var style = document.createElement("style");
				style.id = "custom-remark-styles";

				// style.textContent =
				//   'body {' +
				//   '  background-color: green;' +
				//   '  font-weight: italic;' +
				//   '}'
				// ;

				style.textContent =
					"body { background-color: green; font-weight: italic; }\n" +
					"p { padding-bottom: 0; padding-top: 0; }\n" +
					"h1 { margin-top: 0; margin-bottom: 0; }\n" +
					"div { padding-bottom: 0; padding-top: 0; }";

				iframe.contentDocument.head.appendChild(style);
				// console.log(iframe.contentDocument.head);

				// and disconnect
				observer.disconnect();
			});
		}
	}
});

var observerConfig = {
	childList: true,
};

var targetNode = document.getElementById("remark42");
observer.observe(targetNode, observerConfig);
*/
