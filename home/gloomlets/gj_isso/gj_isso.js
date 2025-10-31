class Gj_isso {
	constructor() {
		var script = document.createElement("script");
		script.setAttribute("foo", "bar");
		script.setAttribute("data-isso", "https://isso.trashbird.gay/");
		script.src = "https://isso.trashbird.gay/js/embed.js";
		document.body.appendChild(script);
	}

	update_language() {
		//this._write_page();
	}
}

const gj_isso = new Gj_isso();
gloomlet_scripts.push(gj_isso);
