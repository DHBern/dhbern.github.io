// Browsable, searchable view of the DH Bern Zotero group library.
// Reads the public Zotero Web API (v3) directly from the browser; no key is needed
// because the group library is public. Collections load once, items load lazily
// when a collection is opened, search goes to the API's own quick search.
(function () {
	'use strict';

	const root = document.getElementById('zotero-bibliography');
	if (!root) return;

	const GROUP = root.dataset.group;
	const API = `https://api.zotero.org/groups/${GROUP}`;
	const WEB = 'https://www.zotero.org/groups/2386895/dh_unibe';
	const PAGE = 50;

	const TYPE_LABELS = {
		book: 'Book',
		bookSection: 'Book chapter',
		journalArticle: 'Journal article',
		magazineArticle: 'Magazine article',
		newspaperArticle: 'Newspaper article',
		conferencePaper: 'Conference paper',
		thesis: 'Thesis',
		report: 'Report',
		webpage: 'Web page',
		blogPost: 'Blog post',
		presentation: 'Presentation',
		dataset: 'Dataset',
		computerProgram: 'Software',
		videoRecording: 'Video',
		podcast: 'Podcast',
		document: 'Document',
		encyclopediaArticle: 'Encyclopedia article',
		preprint: 'Preprint'
	};

	const state = {
		sort: 'creator',
		mode: 'titleCreatorYear',
		query: '',
		tag: '',
		searchStart: 0,
		searchToken: 0
	};

	// ---------- helpers ----------

	function el(tag, attrs, ...children) {
		const node = document.createElement(tag);
		for (const [k, v] of Object.entries(attrs || {})) {
			if (v === undefined || v === null || v === false) continue;
			if (k === 'class') node.className = v;
			else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
			else node.setAttribute(k, v === true ? '' : v);
		}
		for (const c of children.flat()) {
			if (c === null || c === undefined || c === '') continue;
			node.append(c instanceof Node ? c : document.createTextNode(String(c)));
		}
		return node;
	}

	async function api(path, params) {
		const url = new URL(API + path);
		url.searchParams.set('v', '3');
		url.searchParams.set('format', 'json');
		for (const [k, v] of Object.entries(params || {})) {
			if (v !== '' && v !== undefined) url.searchParams.set(k, v);
		}
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Zotero API ${res.status}`);
		const total = parseInt(res.headers.get('Total-Results') || '0', 10);
		return { data: await res.json(), total };
	}

	// Natural sort so that "2 Methoden" follows "1 Fächer" and "Band 10" follows "Band 9".
	const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });

	function sortParams() {
		if (state.sort === 'date') return { sort: 'date', direction: 'desc' };
		return { sort: state.sort, direction: 'asc' };
	}

	function year(item) {
		const d = item.meta.parsedDate || item.data.date || '';
		const m = d.match(/\d{4}/);
		return m ? m[0] : 'n.d.';
	}

	function personName(c) {
		if (c.name) return c.name;
		return [c.firstName, c.lastName].filter(Boolean).join(' ');
	}

	function errorBox(message) {
		return el(
			'p',
			{ class: 'zb-error' },
			`${message} The library is also available directly at `,
			el('a', { href: WEB + '/library' }, 'zotero.org'),
			'.'
		);
	}

	// ---------- items ----------

	function itemSummary(item) {
		const d = item.data;
		const who = item.meta.creatorSummary || '';
		return el(
			'summary',
			{},
			el(
				'span',
				{ class: 'zb-cite' },
				who ? el('span', { class: 'zb-who' }, who) : null,
				el('span', { class: 'zb-year' }, ` (${year(item)}) `),
				el('span', { class: 'zb-title' }, d.title || '[untitled]')
			),
			el('span', { class: 'zb-type' }, TYPE_LABELS[d.itemType] || d.itemType)
		);
	}

	function container(d) {
		const parts = [];
		const host =
			d.publicationTitle ||
			d.bookTitle ||
			d.proceedingsTitle ||
			d.encyclopediaTitle ||
			d.websiteTitle ||
			d.blogTitle ||
			'';
		if (host) {
			let s = host;
			if (d.volume) s += ` ${d.volume}`;
			if (d.issue) s += ` (${d.issue})`;
			parts.push(s);
		}
		const pub = [d.place, d.publisher || d.institution || d.university].filter(Boolean).join(': ');
		if (pub) parts.push(pub);
		if (d.date) parts.push(d.date);
		if (d.pages) parts.push(`pp. ${d.pages}`);
		return parts.join(', ');
	}

	function itemBody(item) {
		const d = item.data;
		const rows = [];
		const row = (label, ...value) => rows.push(el('dt', {}, label), el('dd', {}, ...value));

		const byRole = {};
		for (const c of d.creators || []) {
			(byRole[c.creatorType] = byRole[c.creatorType] || []).push(personName(c));
		}
		for (const [role, names] of Object.entries(byRole)) {
			const label = role.charAt(0).toUpperCase() + role.slice(1) + (names.length > 1 ? 's' : '');
			row(label, names.join('; '));
		}
		const where = container(d);
		if (where) row('Published', where);
		if (d.DOI) row('DOI', el('a', { href: `https://doi.org/${d.DOI}` }, d.DOI));
		if (d.ISBN) row('ISBN', d.ISBN);
		if (d.url) row('URL', el('a', { href: d.url }, d.url));
		if (d.citationKey) row('Citation key', el('code', {}, d.citationKey));

		const body = el('div', { class: 'zb-body' }, el('dl', {}, rows));
		if (d.abstractNote) body.append(el('p', { class: 'zb-abstract' }, d.abstractNote));
		if (d.tags && d.tags.length) {
			body.append(
				el(
					'div',
					{ class: 'zb-tags' },
					d.tags
						.map((t) => t.tag)
						.sort(collator.compare)
						.map((t) =>
							el(
								'button',
								{
									type: 'button',
									class: 'zb-tag',
									title: `Show all entries tagged “${t}”`,
									onclick: () => setTag(t)
								},
								t
							)
						)
				)
			);
		}
		body.append(
			el(
				'p',
				{ class: 'zb-links' },
				el('a', { href: item.links.alternate.href }, 'Open in Zotero'),
				' · ',
				el('a', { href: `${API}/items/${item.key}?format=bibtex` }, 'BibTeX'),
				' · ',
				el('a', { href: `${API}/items/${item.key}?format=ris` }, 'RIS')
			)
		);
		return body;
	}

	function itemNode(item) {
		return el('details', { class: 'zb-item' }, itemSummary(item), itemBody(item));
	}

	// Renders a page of items into `list` and, when more exist, a button that loads the next page.
	async function loadItems(list, path, params, start, pageSize) {
		const more = list.querySelector(':scope > .zb-more');
		if (more) more.remove();
		const loading = el('li', { class: 'zb-status' }, 'Loading…');
		list.append(loading);
		try {
			const { data, total } = await api(path, {
				...params,
				...sortParams(),
				limit: pageSize,
				start
			});
			loading.remove();
			for (const item of data) list.append(el('li', {}, itemNode(item)));
			const shown = start + data.length;
			if (shown < total) {
				list.append(
					el(
						'li',
						{ class: 'zb-more' },
						el(
							'button',
							{
								type: 'button',
								class: 'btn btn-sm btn-outline-secondary',
								onclick: () => loadItems(list, path, params, shown, pageSize)
							},
							`Show more (${shown} of ${total})`
						)
					)
				);
			}
			return total;
		} catch (e) {
			loading.replaceWith(el('li', {}, errorBox('Could not load the entries.')));
			return null;
		}
	}

	// ---------- collection tree ----------

	let tree = [];

	function buildTree(collections) {
		const byKey = new Map(collections.map((c) => [c.key, { c, children: [] }]));
		const roots = [];
		for (const node of byKey.values()) {
			const parent = node.c.data.parentCollection;
			if (parent && byKey.has(parent)) byKey.get(parent).children.push(node);
			else roots.push(node);
		}
		const sortRec = (nodes) => {
			nodes.sort((a, b) => collator.compare(a.c.data.name, b.c.data.name));
			nodes.forEach((n) => sortRec(n.children));
		};
		sortRec(roots);
		return roots;
	}

	function collectionNode(node) {
		const own = node.c.meta.numItems || 0;
		const subs = node.children.length;
		const info = [];
		if (subs) info.push(`${subs} ${subs === 1 ? 'subcollection' : 'subcollections'}`);
		if (own) info.push(`${own} ${own === 1 ? 'entry' : 'entries'}`);

		const details = el(
			'details',
			{ class: 'zb-coll' },
			el(
				'summary',
				{},
				el('span', { class: 'zb-coll-name' }, node.c.data.name),
				el('span', { class: 'zb-count' }, info.join(', '))
			)
		);
		let loaded = false;
		details.addEventListener('toggle', () => {
			if (!details.open || loaded) return;
			loaded = true;
			if (subs)
				details.append(el('div', { class: 'zb-children' }, node.children.map(collectionNode)));
			if (own) {
				const list = el('ul', { class: 'zb-items' });
				details.append(list);
				loadItems(list, `/collections/${node.c.key}/items/top`, {}, 0, PAGE);
			}
		});
		return details;
	}

	function renderTree() {
		treeBox.replaceChildren(...tree.map(collectionNode));
	}

	async function loadCollections() {
		treeBox.replaceChildren(el('p', { class: 'zb-status' }, 'Loading collections…'));
		try {
			let all = [];
			let start = 0;
			let total = Infinity;
			while (start < total) {
				const res = await api('/collections', { limit: 100, start });
				all = all.concat(res.data);
				total = res.total;
				start += res.data.length;
				if (!res.data.length) break;
			}
			tree = buildTree(all);
			renderTree();
		} catch (e) {
			treeBox.replaceChildren(errorBox('Could not load the collections.'));
		}
	}

	// ---------- search ----------

	let debounce;

	function syncUrl() {
		const url = new URL(location.href);
		state.query ? url.searchParams.set('search', state.query) : url.searchParams.delete('search');
		state.tag ? url.searchParams.set('tag', state.tag) : url.searchParams.delete('tag');
		history.replaceState(null, '', url);
	}

	function setTag(tag) {
		state.tag = tag;
		runSearch();
		root.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function runSearch() {
		syncUrl();
		tagChip.replaceChildren();
		if (state.tag) {
			tagChip.append(
				'Tag: ',
				el('strong', {}, state.tag),
				' ',
				el('button', {
					type: 'button',
					class: 'btn-close btn-sm',
					'aria-label': 'Remove tag filter',
					onclick: () => {
						state.tag = '';
						runSearch();
					}
				})
			);
		}
		const active = state.query.length >= 2 || state.tag;
		resultsBox.hidden = !active;
		treeBox.hidden = !!active;
		if (!active) return;

		const token = ++state.searchToken;
		const list = el('ul', { class: 'zb-items' });
		const heading = el('p', { class: 'zb-status' });
		resultsBox.replaceChildren(heading, list);
		const params = { tag: state.tag };
		if (state.query.length >= 2) {
			params.q = state.query;
			params.qmode = state.mode;
		}
		const total = await loadItems(list, '/items/top', params, 0, PAGE);
		if (token !== state.searchToken) return;
		if (total === null) heading.remove();
		else
			heading.textContent = total
				? `${total} ${total === 1 ? 'entry' : 'entries'} found`
				: 'No entries found.';
	}

	// ---------- layout ----------

	const searchInput = el('input', {
		type: 'search',
		class: 'form-control',
		placeholder: 'Search author, title, year…',
		'aria-label': 'Search the bibliography',
		oninput: (e) => {
			state.query = e.target.value.trim();
			clearTimeout(debounce);
			debounce = setTimeout(runSearch, 350);
		}
	});

	const modeSelect = el(
		'select',
		{
			class: 'form-select',
			'aria-label': 'Search in',
			onchange: (e) => {
				state.mode = e.target.value;
				runSearch();
			}
		},
		el('option', { value: 'titleCreatorYear' }, 'Title, author, year'),
		el('option', { value: 'everything' }, 'All fields and full text')
	);

	const sortSelect = el(
		'select',
		{
			class: 'form-select',
			'aria-label': 'Sort entries by',
			onchange: (e) => {
				state.sort = e.target.value;
				renderTree();
				runSearch();
			}
		},
		el('option', { value: 'creator' }, 'Sort by author'),
		el('option', { value: 'date' }, 'Sort by year (newest first)'),
		el('option', { value: 'title' }, 'Sort by title')
	);

	const tagChip = el('div', { class: 'zb-tagfilter' });
	const treeBox = el('div', { class: 'zb-tree' });
	const resultsBox = el('div', { class: 'zb-results', hidden: true, 'aria-live': 'polite' });

	root.replaceChildren(
		el(
			'div',
			{ class: 'zb-toolbar' },
			el('div', { class: 'zb-search' }, searchInput),
			modeSelect,
			sortSelect
		),
		tagChip,
		resultsBox,
		treeBox
	);

	const initial = new URLSearchParams(location.search);
	state.query = (initial.get('search') || '').trim();
	state.tag = initial.get('tag') || '';
	searchInput.value = state.query;

	loadCollections();
	runSearch();
})();
