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
		html.style.setProperty("overflow-x", "unset");
	});
});

// Classes for loading in comic data

class ComicDB {
	id = "";
	page_type = "paginated";
	languages = ["en"];
	chapters = [];
	initalized = false;
	
	constructor() {
	}
	
	async init_database() {
		try {
			let response = await fetch("db.json", {});
			response = JSON.parse(await response.text());
			this.id = response.id;
			this.page_type = response.page_type;
			this.languages = response.languages;

			for (let ci = 0; ci < response.chapters.length; ci++) {
				const chap = new Chapter(response.chapters[ci]);
				chap["chapter_num"] = ci + 1;
				this.chapters.push(chap);
			}

			console.debug("Database loaded successfully");
			return true;
		} catch (e) {
			console.debug("Failed to load database");
			console.error(e);
			return false;
		}
	}

	async get_previous_page_id(page_id) {
		for (let i = 0; i <= this.chapters.length; i++) {
			let index = this.chapters[i].pages.findIndex((pg) => {
				return pg.id == page_id;
			});
			if (index == -1) {
				continue 
			}
			if (index == 0) {
				if (i == 0) {
					return false
				} else {
					let len = this.chapters[i -1].pages.length
					return this.chapters[i - 1].pages[len - 1]
				}
			} else {
				return  this.chapters[i].pages[index - 1].id
			}
		}
	}

	async get_next_page_id(page_id) {
		for (let i = 0; i <= this.chapters.length; i++) {
			let index = this.chapters[i].pages.findIndex((pg) => {
				return pg.id == page_id;
			});
			if (index == -1) {
				continue 
			}
			if (index == (this.chapters[i].pages.length - 1)) {
				if (i == (this.chapters.length - 1)) {
					return false
				} else {
					return this.chapters[i + 1].pages[0]
				}
			} else {
				return  this.chapters[i].pages[index + 1].id
			}
		}
	}
	
	async get_first_page_id() {
		return this.chapters[0].pages[0].id;
	}
	
	async get_latest_page_id() {
		let ch = this.chapters.length - 1;
		let pg = this.chapters[ch].pages.length - 1;
		return this.chapters[ch].pages[pg].id
	}
	
	async get_page_by_id(page_id) {
		if (page_id == -1) {
			return false
		}
		for (const ch of this.chapters) {
			for (const pg of ch.pages) {
				if (pg.id == page_id) {
					return pg
				}
			}
		}
		return false
	}

	async get_chapter_by_id(chap_id) {
		for (const ch of this.chapters) {
			if (ch.id == chap_id) {
				return ch
			}
		}
		return false
	}
}

class Chapter {
	id;
	title;
	pages = [];
	
	constructor(dict) {
		this.id = dict.id;
		this.title = dict.title;

		for (let pi = 0; pi < dict.pages.length; pi++) {
			let page = new Page(dict.pages[pi])
			page["chapter_id"] = this.id;
			page["page_num"] = pi + 1;
			this.pages.push(page);
		}
	}
}

class Page {
	id;
	title;
	thumbnail;
	pubDate;
	page_type;
	page_length;
	image_filename;
	author_comment;
	
	constructor(dict) {
		this.id = dict.id;
		this.title = dict.title;
		this.thumbnail = dict.thumbnail;
		this.pubDate = dict.pubDate;
		this.page_type = dict.page_type;
		this.page_length = dict.page_length;
		this.image_filename = dict.image_filename;
		this.author_comment = dict.author_comment;
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
		comic_db.initalized = true;
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
			await gj_i18n.load_gloomlet(name);
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