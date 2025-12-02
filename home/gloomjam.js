gloomlet_scripts = [];
gloomlet_names = [];

window.addEventListener("load", function () {
	let html = document.querySelector("html");
	let scroller = document.querySelector("body");

	// Force scrollbars to display
	scroller.style.setProperty("overflow", "scroll");
	scroller.style.setProperty("overflow-x", "unset");
	html.style.setProperty("overflow-x", "unset");

	// Wait for next from so scrollbars appear
	requestAnimationFrame(() => {
		// True width of the viewport, minus scrollbars
		scroller.style.setProperty("--vw", scroller.clientWidth / 100);

		// Width of the scrollbar
		scroller.style.setProperty(
			"--scrollbar-width",
			`${window.innerWidth - scroller.clientWidth}px`
		);

		// Reset overflow
		scroller.style.setProperty("overflow", "");
		scroller.style.setProperty("overflow-x", "hidden");
		html.style.setProperty("overflow-x", "hidden");
	});
});

// Classes for loading in comic data

class ComicDB {
	chapters = [];
	pages = [];
	initialized = false;
	
	constructor() {
	}
	
	async init_database() {
		try {
			let response = await fetch("comic/chapters.json", {});
			response = JSON.parse(await response.text());
			const chapters = response.chapters;
			for (const chap_id of chapters) {
				const chap = new Chapter(chap_id);
				await chap.init_chapter(this.pages);
				this.chapters.push(chap);
				this.pages = this.pages.concat(chap.pages);
			}
			this.initialized = true;
			console.debug("Database loaded successfully");
			return true;
		} catch (e) {
			console.debug("Failed to load database");
			console.error(e);
			return false;
		}
	}
	
	async get_page_by_number(page_num) {
		let page = this.pages[this.pages.length - 1];
		if (page_num > 0 && page_num <= this.pages.length) {
			page = this.pages[page_num - 1]
		}
		if (!page.initialized) {
			await page.init_page();
		}
		return page
	}
	
	async get_page_by_id(page_id) {
		let page = this.pages[this.pages.length - 1];
		for (const pg of this.pages) {
			if (pg.id == page_id) {
				page = pg;
			}
		}
		if (!page.initialized) {
			await page.init_page();
		}
		return page
	}

	async get_chapter_by_id(ch_id){
		let chap = false;
		for (const ch of this.chapters) {
			if (ch.id == ch_id) {
				chap = ch;
			}
		}
		return chap
	}

}

class Chapter {
	id;
	title;
	pages = [];
	page_range = [];
	length;
	
	constructor(chap_id) {
		this.id = chap_id;
	}
	
	async init_chapter(db_pages) {
		try {
			console.debug(`Attempting to load chapter ${this.id}`);
			let response = await fetch(`comic/${this.id}/chapter.json`, {});
			response = JSON.parse(await response.text());
			this.title = response.title;
			this.page_range[0] = db_pages.length + 1;
			this.page_range[1] = this.page_range[0];
			for (const page_id of response.pages) {
				const pg = new Page(page_id, this.page_range[1], this.id);
				this.page_range[1] += 1;
				this.pages.push(pg);
			}
			this.page_range[1] -= 1;
			this.length = this.page_range[1] - this.page_range[0] + 1;
			console.debug(`Successfully loaded chapter ${this.id}`);
			return true;
		} catch (e) {
			console.debug(`Failed to load chapter ${this.id}`);
			console.error(e);
			return false;
		}
	}
}

class Page {
	id;
	chapter;
	number;
	languages;
	initialized = false;
	
	constructor(page_id, page_num, chap_id) {
		this.id = page_id;
		this.number = page_num;
		this.chapter = chap_id;
	}

	async init_page() {
		try {
			console.debug(`Attempting to load page ${this.id}`);
			let response = await fetch(`comic/${this.chapter}/${this.id}/page.json`, {});
			response = JSON.parse(await response.text());
			for (const [key, value] of Object.entries(response)) {
				console.log(`${key}: ${value}`);
				this[key] = value;
			}
			this.fill_empty_translations();
			this.initialized = true;
			console.debug(`Successfully loaded page ${this.id}`);
			console.debug(this);
		} catch(e) {
			console.debug(`Failed to load page ${this.id}`);
			console.error(e);
		}
	}

	fill_empty_translations() {
		if (this.locales.length > 1) {
				for (let i = 1; i < this.locales.length; i++) {
					for (const [key, value] of Object.entries(this.locales[i])) {
						try {
							if (value == "") {
								this.locales[i][key] = this.locales[0][key];
							}
						} catch(e) {}
					}
				}
			}
	}
}

const comic_db_init_event = new Event("comic_db_initialized");
document.addEventListener('comic_db_initialized', () => {
	console.debug('Comic database has been initialized');
});

const comic_db = new ComicDB();
async function init_db() {
	const res = await comic_db.init_database();
	if (res) {
		document.dispatchEvent(comic_db_init_event);
		console.debug(comic_db);
	}
}
init_db();

// Hijack css animations to find elements as they appear in the DOM

let animation_counter = 0;

function wait_for_element(selector, func) {
	parent = document.body;

	const animationName = `waitForElement__${animation_counter++}`;

	const style = document.createElement("style");

	const keyFrames = `
        @keyframes ${animationName} {
            from { opacity: 1; }
            to { opacity: 1; }
        }
        ${selector} {
			animation-duration: 1ms;
			animation-name: ${animationName};
        }
    `;

	style.appendChild(new Text(keyFrames));

	document.head.appendChild(style);

	const eventListener = (event) => {
		if (event.animationName === animationName) {
			func(event.target);
		}
	};

	document.addEventListener("animationstart", eventListener, false);
}

// load in gloomlets as they appear in the DOM

wait_for_element("gloomlet", async (element) => {
	if (element.getAttribute("name")) {
		const name = element.getAttribute("name");
		//console.log("loading content for gloomlet", name, "at", element);
		gloomlet_names.push(name);
		const js = async () => {
			var script = document.createElement("script");
			script.src = `gloomlets/${name}/${name}.js`;
			document.body.appendChild(script);
			//console.log(`loaded JS for: ${name}`);
		};
		const html = async () => {
			fetch(`gloomlets/${name}/${name}.html`)
				.then((response) => response.text())
				.then((text) => {
					element.innerHTML = text;
					//console.log("loaded HTML for: ", name);
					js();
					gj_i18n.load_gloomlet(name);
				});
		};
		const css = async () => {
			fetch(`gloomlets/${name}/${name}.css`).then(() => {
				const linktag = document.createElement("LINK");
				linktag.setAttribute("href", `gloomlets/${name}/${name}.css`);
				linktag.setAttribute("rel", "stylesheet");
				linktag.setAttribute("type", "text/css");
				linktag.setAttribute("media", "all");
				document.head.appendChild(linktag);
				//console.log("loaded CSS for: ", name);
				html();
			});
		};
		css();
	}
});