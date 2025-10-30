class Isso {
    constructor() {
        var script = document.createElement("script");
        script.setAttribute("data-isso", "https://isso.trashbird.gay/");
		script.src = "https://isso.trashbird.gay/js/embed.min.js";
		document.body.appendChild(script);
    }

    update_language() {
		//this._write_page();
	}
}

const isso = new Isso();
gloomlet_scripts.push(isso);