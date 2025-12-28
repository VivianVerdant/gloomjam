class Blog {
	initialized = false;
	mode = "standard";

	constructor() {
		this.mode = document.querySelector("gloomlet[name='blog']").getAttribute("mode");
		this._main();
	}

	async _main() {
		try {
			let response = await fetch("blog/blog.json", {});
			response = JSON.parse(await response.text());
			const root = document.querySelector("layout.blog_content");
			root.innerHTML = "";
			const posts = response.posts;
			switch (this.mode) {
				case "standard":
					for (const post of posts) {
						const post_element = document.createElement("div");
						post_element.classList.add("blog_post","ninepatch_paper");
						post_element.setAttribute("date", post);
						root.appendChild(post_element);
					}
					break
				case "latest_post":
					const container_node = document.createElement("div");
					container_node.classList.add("latest_post");
					root.appendChild(container_node);
					container_node.setAttribute("onclick", "window.location = 'blog.html'")
					container_node.setAttribute("href", "/blog.html");

					const text_node = document.createElement("h3");
					text_node.classList.add("read_full_post");
					text_node.setAttribute("data-i18n","read_latest_post")
					text_node.innerText = "Latest Blog Post:";
					container_node.appendChild(text_node);
	
					const post_element = document.createElement("div");
					post_element.classList.add("blog_post");
					post_element.setAttribute("date", posts[0]);
					container_node.appendChild(post_element);
					break
				default:
					break
			}

			this.initialized = true;
			wait_for_element(".blog_post", (node) => {
				console.debug(node);
				this._load_post(node)
			});
			console.debug("Blog database loaded successfully");
			return true;
		} catch (e) {
			console.debug("Failed to load blog database");
			console.error(e);
			return false;
		}
	}

	async _load_post(node) {
		const date = node.getAttribute("date");
		let post;
		try {
			console.debug(`Attempting to load blog date ${date}`);
			let response = await fetch(`blog/posts/${date}.json`, {});
			post = JSON.parse(await response.text());
			console.debug(`Successfully loaded blog date ${date}`);
		} catch (e) {
			console.debug(`Failed to load blog date ${date}`);
			console.error(e);
			return false;
		}
		post = this.fill_empty_translations(post);
		let locale = post.locales.filter((lang) => lang.code == localStorage.language)[0];

		if (this.mode == "standard") {
			const heading_node = document.createElement("layout");
			heading_node.classList.add("flow-row", "post_heading");
			node.appendChild(heading_node);

			const title_node = document.createElement("h1");
			title_node.classList.add("post_title");
			title_node.innerHTML = locale.title;
			heading_node.appendChild(title_node);

			const date_node = document.createElement("div");
			date_node.classList.add("post_date");
			date_node.innerHTML = post.publication_date;
			heading_node.appendChild(date_node);

			if (post.image) {
				const img_node = document.createElement("img");
				img_node.classList.add("post_img");
				img_node.src = `/blog/posts/images/${post.image}`;
				node.appendChild(img_node);
			}

			const text_node = document.createElement("div");
			text_node.classList.add("post_text");
			text_node.innerHTML = locale.text;
			node.appendChild(text_node);
		}

		if (this.mode == "latest_post") {
			const heading_node = document.createElement("layout");
			heading_node.classList.add("flow-row", "post_heading");
			node.appendChild(heading_node);

			const title_node = document.createElement("h4");
			title_node.classList.add("post_title");
			title_node.innerHTML = locale.title;
			heading_node.appendChild(title_node);

			const date_node = document.createElement("p");
			date_node.classList.add("post_date");
			date_node.innerHTML = post.publication_date;
			heading_node.appendChild(date_node);
		}
	}

	fill_empty_translations(post) {
		if (post.locales.length > 1) {
			for (let i = 1; i < post.locales.length; i++) {
				for (const [key, value] of Object.entries(post.locales[i])) {
					try {
						if (value == "") {
							post.locales[i][key] = post.locales[0][key];
						}
					} catch(e) {}
				}
			}
		}
		return post
	}

	update_language() {
		this._main();
	}
}

const blog = new Blog();
gloomlet_scripts.push(blog);
