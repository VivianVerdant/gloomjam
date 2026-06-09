class Archive {
	constructor() {
		document.addEventListener("click", (event) => {
			if (event.target.parentNode.classList.contains("expandable")) {
				console.log(event.target);
				event.target.parentNode
					.querySelector(".page_collapse")
					.classList.toggle("open");
			}
		});

		if (comic_db && comic_db.initalized) {
			this._main();
		} else {
			document.addEventListener('comic_db_initialized', () => {
				this._main();
			});
		}
	}

	async update_language() {
		this._main();
	}

	async _main() {
		let archive_html = "";
		for (const chapter of comic_db.chapters) {
			let ch_title = chapter.title[localStorage.language];
			if (!ch_title || ch_title.length == 0) {
				ch_title = lang_db[localStorage.language].chapter + " " + chapter.chapter_num;
			}
			let pages_html = "";
			for (const page of chapter.pages) {
				let pg_title = page.title[localStorage.language];
					if (!pg_title || pg_title.length == 0) {
						pg_title = lang_db[localStorage.language].page + " " + page.page_num;
					}
				let html = `<a class="page" href="/?page=${page.id}">
					<div>
						<img src="${page.thumbnail}" class="thumbnail" />
					</div>
					<div class="page_info">
					<h3>${pg_title}</h3>
					<!--- <span>${page.pubDate}</span> --->
					</div>
				</a>
				`;
				pages_html = pages_html.concat(html);
			}
			let chapter_html = `<div class="chapter expandable open">
			<h2 class="ninepatch_title">${ch_title}</h2>
			<div class="page_collapse ninepatch_paper_2">
			<div class="page_list">
			${pages_html}
			</div>
			</div>
			</div>`;
			archive_html = archive_html.concat(chapter_html);
		}
		document.getElementById("archive_content").innerHTML = archive_html;
		document.querySelector(".chapter:last-of-type .page_collapse").click();
	}

	expand_collapse_all() {
		const current_state = document.querySelector(".chapter:first-of-type .page_collapse").classList.contains("open");
		const chapter_elements = document.querySelectorAll(".chapter .page_collapse");
		if (current_state) {
			for (const el of chapter_elements) {
				el.classList.remove("open")	
			}
		} else {
			for (const el of chapter_elements) {
				el.classList.add("open")	
			}
		}
	}
}

const archive = new Archive();
gloomlet_scripts.push(archive);
