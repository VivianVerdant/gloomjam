class Reader {
	current_page;

	constructor() {
		document.addEventListener("click", (event) => {
			if (
				!event.target.classList.contains("toggle") &&
				!document
					.querySelector(".reader_settings")
					.classList.contains("hide_dropdown")
			) {
				document
					.querySelector(".reader_settings")
					.classList.add("hide_dropdown");
			}
		});

		document.body.addEventListener("scroll", (event) => {
			document
				.querySelector(".reader_settings")
				.classList.add("hide_dropdown");
		});

		document.addEventListener("scroll", (event) => {
			document
				.querySelector(".reader_settings")
				.classList.add("hide_dropdown");
		});

		if (comic_db && comic_db.initialized) {
			this._main();
		} else {
			document.addEventListener('comic_db_initialized', () => {
				this._main();
			});
		}

		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight") {
				e.preventDefault();
				this.nav_to_next_page();
			}
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				this.nav_to_prev_page();
			}
		});
	}

	async _main() {
		// Prioritize URL queries
		const query = new URLSearchParams(window.location.search);
		let page_to_load = -1;
		if (query.size) {
			for (const [key, value] of query.entries()) {
				switch (key) {
					case "page":
						page_to_load = value;
						break;
					default:
						query.delete(key);
						break;
				}
			}
		}

		// Fill in with stored user preferences, if found
		if (localStorage.length) {
			for (const [key, value] of Object.entries(localStorage)) {
				switch (key) {
					case "latest_read_page":
						if (query.has("page")) {
							break;
						}
						page_to_load = value;
						break;
					case "preferred_scale":
						this.choose_page_scale(value);
						break;
					case "colorize_page":
						if (typeof localStorage.colorize_page != "boolean") {
							localStorage.colorize_page = false;
						}
						if (localStorage.colorize_page) {
							document
								.querySelector(".page_container")
								.classList.add("colorize_page");
						} else {
							document
								.querySelector(".page_container")
								.classList.remove("colorize_page");
						}
						document.getElementById("other-options-0").checked = localStorage.colorize_page;
						break;
					default:
						break;
				}
			}
		}

		switch (localStorage.language) {
			case "es":
				document.getElementById("language-group-1").checked = true;
				break
			default:
				document.getElementById("language-group-0").checked = true;
				break
		}

		const page_obj = await comic_db.get_page_by_number(page_to_load);
		this.set_current_page(page_obj);

		// If the current page is wider than the user's window
		// and they have original size as their preferred,
		// override it and set to width instead
		/*
		if (
			window.innerWidth <
			document.querySelector("#comicpage img").getBoundingClientRect()
				.width
		) {
			this.set_page_scale("width");
		}
		*/
		this.update_url();
	}

	async set_current_page(page_obj) {
		this.current_page = page_obj;
		console.debug(page_obj);
		//window.current_page = page_obj;
		this._write_page();
		for (const script of gloomlet_scripts.values()) {
			try {
				script.update_page();
			} catch (e) { }
		}
	}

	//function used to write comic page to web page
	async _write_page() {
		// set all locale based data
		let locale = this.current_page.locales.filter((lang) => lang.code == localStorage.language)[0];
		console.debug(locale);
		this.update_image(locale);
		this.update_alt_text(locale);
		this.update_page_info(locale);
		this.update_author_notes(locale);
		this.update_url();
		this.update_nav_options();
	}

	update_image(locale) {
		const image_node = document.querySelector("#comicpage img");
		const path = `comic/${this.current_page.chapter}/${this.current_page.id}/${locale.image}`;
		image_node.setAttribute("src", path);
	}

	update_author_notes(locale) {
		const author_notes = document.querySelector(".author_notes .text");
		author_notes.innerHTML = locale.comment;
		const comment_image = document.getElementById("comment_image");
		if (locale.comment == "" && this.current_page.comment_image == "") {
			document.querySelector(".author_notes").classList.add("hidden");
		} else {
			document.querySelector(".author_notes").classList.remove("hidden");
		}
		if (this.current_page.comment_image != "") {
			comment_image.src = `comic/${this.current_page.chapter}/${this.current_page.id}/${this.current_page.comment_image}`;
			comment_image.classList.remove("hidden");
		} else {
			comment_image.removeAttribute("src");
			comment_image.classList.add("hidden");
		}
	}

	update_alt_text(locale) {
		try {
			const text = locale.alt_text;
			if (text != "") {
				document
					.querySelector(".text_description")
					.classList.remove("hidden");
				document
					.querySelector(".text_description_toggle")
					.classList.remove("hidden");
				const text_element =
					document.querySelector(".text_description");
				text_element.innerHTML = text;
			} else {
				document
					.querySelector(".text_description")
					.classList.add("hidden");
				document
					.querySelector(".text_description_toggle")
					.classList.add("hidden");
			}
		} catch (e) {
			document.querySelector(".text_description").classList.add("hidden");
			document
				.querySelector(".text_description_toggle")
				.classList.add("hidden");
		}
	}

	async update_page_info(locale) {
		const chap = await comic_db.get_chapter_by_id(this.current_page.chapter);
		if (chap && localStorage.language) {
			document.getElementById("chapter_name").innerHTML = chap.title[`${localStorage.language}`] ? chap.title[`${localStorage.language}`] : chap.title["en"];
			document.querySelector(".comicpage_info_wrapper").classList.remove("hidden");
		}
		if (locale.title) {
			document.getElementById("page_name").innerHTML = locale.title;
			document.querySelector(".comicpage_info_wrapper").classList.remove("hidden");
		}
		if (chap.title[`${localStorage.language}`] && locale.title) {
			document.getElementById("chapter_name").innerText += ", "
		}
	}

	show_reader_help() {
		document.querySelector(".reader_help").classList.remove("hidden");
	}

	toggle_scale_popout() {
		const element = document.querySelector(".reader_settings");
		var rect = document
			.querySelector(".scale_selector")
			.getBoundingClientRect();
		//console.log(rect);
		const dropdown = document.querySelector(".reader_settings dropdown");
		dropdown.style.top = `${rect.bottom}px`;
		dropdown.style.left = `${rect.left}px`;
		element.classList.toggle("hide_dropdown");
	}

	choose_page_scale(selection) {
		this.set_page_scale(selection);
		//const page_el = document.getElementById("comicpage");
		//page_el.scrollIntoView({ behavior: "smooth", block: "start" });
		localStorage.preferred_scale = selection;
	}

	set_page_scale(selection) {
		const page_el = document.getElementById("comicpage");
		const fit_list = [
			"fit_width",
			"fit_height",
			"fit_both",
			"fit_original",
		];
		switch (selection) {
			case "height":
				page_el.classList.remove(...fit_list);
				page_el.classList.add("fit_height");
				break;
			case "both":
				document.getElementById("view-group-0").checked = true;
				page_el.classList.remove(...fit_list);
				page_el.classList.add("fit_both");
				break;
			case "original":
				document.getElementById("view-group-2").checked = true;
				page_el.classList.remove(...fit_list);
				page_el.classList.add("fit_original");
				break;
			default:
				document.getElementById("view-group-1").checked = true;
				page_el.classList.remove(...fit_list);
				page_el.classList.add("fit_width");
				break;
		}
	}

	set_page_colorize(value) {
		console.debug("colorize before", localStorage.colorize_page);
		console.debug(value);
		localStorage.colorize_page = value;
		console.debug("colorize after", localStorage.colorize_page);
		if (localStorage.colorize_page == "true") {
			document
				.querySelector(".page_container")
				.classList.add("colorize_page");
		} else {
			document
				.querySelector(".page_container")
				.classList.remove("colorize_page");
		}
	}

	toggle_text_description() {
		document.querySelector(".text_description").classList.toggle("open");
	}

	// dynamically react to window resizing, pretty glitchy at the moment
	// TODO: fix the glitchyness
	/*
	window.addEventListener(
		"resize",
		debounce(function (e) {
			const page_elem = document.getElementById("comicpage");
			const img_width = page_elem
				.querySelector("img")
				.getBoundingClientRect().width;
			if (
				page_elem.classList.contains("fit_width") &&
				window.innerWidth > img_width
			) {
				set_page_scale("original");
			} else if (
				page_elem.classList.contains("fit_original") &&
				window.innerWidth < img_width
			) {
				set_page_scale("fit_width");
			}
		})
	);
	
	function debounce(func) {
		var timer;
		return function (event) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(func, 100, event);
		};
	}
	*/

	update_nav_options() {
		const nav_first = Array.from(document.querySelectorAll(".nav_first"));
		const nav_prev = Array.from(document.querySelectorAll(".nav_prev"));
		const nav_next = Array.from(document.querySelectorAll(".nav_next"));
		const nav_last = Array.from(document.querySelectorAll(".nav_last"));
		if (this.current_page.number == 1) {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.add("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.remove("hide_nav");
			}
		} else if (this.current_page.number == comic_db.pages.length) {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.remove("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.add("hide_nav");
			}
		} else {
			for (const el of nav_first.concat(nav_prev)) {
				el.classList.remove("hide_nav");
			}
			for (const el of nav_last.concat(nav_next)) {
				el.classList.remove("hide_nav");
			}
		}
	}

	on_click_page(event) {
		let rect = document.getElementById("comicpage").getBoundingClientRect();
		const quarter = (rect.right - rect.left) / 4;
		if (event.clientX < rect.left + quarter) {
			this.nav_to_prev_page();
		} else if (event.clientX > rect.right - quarter) {
			this.nav_to_next_page();
		} else {
			document
				.getElementById("comicpage")
				.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}

	async nav_to_page_number(page_num) {
		if (page_num <= comic_db.pages.length && page_num > 0) {
			const page_obj = await comic_db.get_page_by_number(page_num);
			this.set_current_page(page_obj);
		}
	}

	nav_to_first_page() {
		this.nav_to_page_number(1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_prev_page() {
		if (this.current_page.number == 1) {
			return;
		}
		this.nav_to_page_number(this.current_page.number - 1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_next_page() {
		if (this.current_page.number == comic_db.pages.length) {
			return;
		}
		this.nav_to_page_number(this.current_page.number + 1).then(() => {
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	nav_to_last_page() {
		this.nav_to_page_number(comic_db.pages.length).then(() => {
			//console.log("foo");
			localStorage.latest_read_page = this.current_page.identifier;
		});
	}

	update_url() {
		const new_url = new URL(window.location.origin);
		new_url.searchParams.set("page", this.current_page.number);
		window.history.pushState(null, "", new_url.toString());
	}

	update_language() {
		this._write_page();
	}
}

const reader = new Reader();
gloomlet_scripts.push(reader);
