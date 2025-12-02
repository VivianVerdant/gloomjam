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

		if (comic_db && comic_db.initialized) {
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
			const title = chapter.title[`${localStorage.language}`];
			const pages = chapter.pages;
			let pages_html = "";
			for (const page of pages) {
				const page_obj = await comic_db.get_page_by_number(page.number);
				let locale = page_obj.locales.filter((lang) => lang.code == localStorage.language)[0];
				let html = `<a class="page" href="/?page=${page_obj.number}">
					<div>
						<img src="/comic/${chapter.id}/${page.id}/${page_obj.thumbnail}" class="thumbnail" />
					</div>
					<div class="page_info">
					<h3>${locale.title}</h3>
					<!--- <span>${page_obj.publication_date}</span> --->
					</div>
				</a>
				`;
				pages_html = pages_html.concat(html);
			}
			let chapter_html = `<div class="chapter expandable open">
			<h2 class="ninepatch_title">${title}</h2>
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
}

const archive = new Archive();
gloomlet_scripts.push(archive);
