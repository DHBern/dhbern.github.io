// Application check for /teaching/application/ – runs entirely in the browser.
// It stores nothing (no cookies, no localStorage) and sends nothing anywhere.
//
// The steps themselves live once, in the page text (#steps-bern, #steps-swiss, #steps-intl);
// this script picks the matching route and adds dates, eligibility and fees on top.
(function () {
	'use strict';

	const DAY = 86400000;
	const d = (y, m, day) => Date.UTC(y, m - 1, day);
	const fmt = (t) =>
		new Date(t).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	const daysUntil = (t, today) => Math.round((t - today) / DAY);

	// Recurring dates from the admission conditions 2026/27 and the checklist for international applicants.
	function datesFor(season, year) {
		if (season === 'autumn')
			return {
				apply: d(year, 4, 30),
				late: d(year, 8, 31),
				docs: d(year, 5, 31),
				diploma: d(year, 8, 31),
				reregFrom: d(year, 5, 20),
				reregTo: d(year, 8, 31),
				zib: d(year, 9, 30),
				invite: 'early April ' + year
			};
		return {
			apply: d(year - 1, 12, 15),
			late: d(year, 1, 31),
			docs: d(year - 1, 12, 31),
			diploma: d(year, 1, 31),
			reregFrom: d(year - 1, 12, 15),
			reregTo: d(year, 1, 31),
			zib: d(year, 3, 31),
			invite: 'early November ' + (year - 1)
		};
	}

	// Starts that can still be applied for (late deadline not passed), soonest first.
	function starts(today) {
		const y = new Date(today).getUTCFullYear(),
			out = [];
		for (let year = y; year <= y + 2; year++)
			for (const season of ['spring', 'autumn']) {
				const dt = datesFor(season, year);
				if (dt.late >= today)
					out.push({
						key: season + '-' + year,
						season,
						year,
						label: (season === 'autumn' ? 'Autumn' : 'Spring') + ' semester ' + year,
						dates: dt
					});
			}
		return out.slice(0, 4);
	}

	// s = { origin: bern|swiss|swissfh|intl, programme: major|minor, basis: hum|cs|sixty|less,
	//       start: {season, year, label, dates}, done, visa, de, en }
	// Returns [{ level: ok|info|warn|error, text }] – text is plain, the renderer escapes it.
	function checks(s, today) {
		const out = [],
			dt = s.start.dates,
			prog = s.programme === 'major' ? 'Major' : 'Minor';
		const ext = s.origin !== 'bern';

		// 1. subject requirement
		if (s.basis !== 'less')
			out.push({
				level: 'ok',
				text:
					s.programme === 'major'
						? 'You meet the subject requirement of the Major: knowledge worth 60 ECTS in the humanities, understood broadly (including Theology and Communication and Media Studies), or in computer science. Conditions can still be set at placement.'
						: "You meet the subject requirement of the Minor: a Bachelor's, or a Minor of at least 60 ECTS, in the humanities, understood broadly (including Theology and Communication and Media Studies), or in computer science. Conditions can still be set at placement."
			});
		else
			out.push({
				level: 'warn',
				text: `The ${prog} expects ${s.programme === 'major' ? 'knowledge worth 60 ECTS in the humanities' : "a Bachelor's or a Minor of at least 60 ECTS in the humanities"} or computer science. Missing knowledge can be required as additional work${s.programme === 'major' ? ' of up to 60 ECTS' : ''}. Talk to the Digital Humanities study advice before you apply.`
			});

		// 2. kind of degree
		if (s.origin === 'swissfh')
			out.push({
				level: 'warn',
				text: "Degrees from a Swiss university of applied sciences or of teacher education never give direct entry: you will be admitted with conditions. Which degrees qualify is listed in the university's annex on Swiss Bachelor's degrees (linked under “Who can apply”)."
			});
		if (s.origin === 'intl')
			out.push({
				level: 'info',
				text: 'Your degree must come from a recognised university after at least three years of academic study. Continuing-education qualifications (Executive Master, certificates, diplomas) are not recognised.'
			});

		// 3. deadlines
		if (s.origin === 'bern') {
			if (dt.reregTo < today)
				out.push({
					level: 'error',
					text: `The registration form for the ${s.start.label} closed on ${fmt(dt.reregTo)}. Choose a later start, or ask the ZIB whether a late change is still possible.`
				});
			else if (dt.reregFrom > today)
				out.push({
					level: 'info',
					text: `Request the change when the registration form opens on ${fmt(dt.reregFrom)} (it closes on ${fmt(dt.reregTo)}).`
				});
		} else if (dt.apply < today) {
			if (s.origin === 'intl' && s.visa)
				out.push({
					level: 'error',
					text: `The deadline for the ${s.start.label} was ${fmt(dt.apply)}, and late applications are not possible if you need a visa. Choose a later start.`
				});
			else
				out.push({
					level: 'warn',
					text: `The regular deadline for the ${s.start.label} (${fmt(dt.apply)}) has passed. A late application is possible until ${fmt(dt.late)}; the application fee is then CHF 250 instead of CHF 150${s.origin === 'intl' ? ', and your documents must follow within two weeks' : ''}.`
				});
		} else {
			const n = daysUntil(dt.apply, today);
			out.push({
				level: n <= 30 ? 'warn' : 'ok',
				text: `Apply online by ${fmt(dt.apply)} – ${n === 0 ? 'that is today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'}.`
			});
		}

		// 4. start in the spring
		if (s.start.season === 'spring')
			out.push({
				level: 'warn',
				text: 'You can start in the spring, but we strongly encourage the autumn: Introduction to DH, the DH Lab and the lecture series are taught only in the autumn. If you start in the spring, plan your first semesters with the study advice.'
			});

		// 5. Bachelor's not yet completed
		if (!s.done) {
			if (s.origin === 'bern')
				out.push({
					level: 'info',
					text: `You can request the change before your Bachelor's is complete. It is approved only once your degree and the placement decision are with the ZIB, by ${fmt(dt.zib)}.`
				});
			else if (s.origin === 'intl')
				out.push({
					level: 'info',
					text: `Your diploma can follow until ${fmt(dt.diploma)}; send the current transcript with your application.`
				});
			else
				out.push({
					level: 'info',
					text: 'Send your diploma once you have it; the placement is based on your transcript.'
				});
		}

		// 6. languages
		const missing = [!s.de && 'German', !s.en && 'English'].filter(Boolean);
		if (missing.length)
			out.push({
				level: 'warn',
				text: `Excellent German and English (level C1) are expected. Your ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} below that. No certificate is checked when you apply, so it is up to you to reach the level before you start.`
			});

		// 7. fees
		if (s.origin === 'intl')
			out.push({
				level: 'info',
				text: "Fees: application fee CHF 150 (late: CHF 250). Each semester: tuition CHF 850, semester fee CHF 34, and CHF 1,700 in addition if you lived outside Switzerland and Liechtenstein when you obtained the qualification that admitted you to your Bachelor's."
			});
		else
			out.push({
				level: 'info',
				text: `Fees: ${ext ? 'application fee CHF 150 (late: CHF 250), invoiced about two weeks after you apply. ' : ''}Each semester: tuition CHF 850 and a semester fee of CHF 34. CHF 1,700 in addition applies if you lived outside Switzerland and Liechtenstein when you obtained the qualification that admitted you to your Bachelor's${s.origin === 'bern' ? '; students enrolled at Bern by spring 2026 keep the former rate of CHF 200 until they complete their current level of study' : ''}.`
			});

		return out;
	}

	// Rows for the dates table: [label, text, status-class, status-text]
	function dateRows(s, today) {
		const dt = s.start.dates,
			rows = [];
		const point = (label, t, note) => {
			const n = daysUntil(t, today);
			rows.push([
				label,
				fmt(t) + (note ? ' – ' + note : ''),
				n < 0 ? 'ap-past' : n <= 30 ? 'ap-soon' : '',
				n < 0 ? 'passed' : n === 0 ? 'today' : 'in ' + n + ' days'
			]);
		};
		if (s.origin === 'bern') {
			const open = dt.reregFrom <= today && today <= dt.reregTo,
				n = daysUntil(open ? dt.reregTo : dt.reregFrom, today);
			rows.push([
				'Registration form',
				fmt(dt.reregFrom) + ' – ' + fmt(dt.reregTo),
				dt.reregTo < today ? 'ap-past' : open ? 'ap-soon' : '',
				dt.reregTo < today
					? 'closed'
					: open
						? 'open, closes in ' + n + ' days'
						: 'opens in ' + n + ' days'
			]);
			point('Placement and degree with the ZIB', dt.zib);
		} else {
			point('Apply online', dt.apply);
			if (s.origin === 'intl') {
				point('Documents by post', dt.docs);
				if (s.visa) rows.push(['Late application', 'not possible with a visa', '', '']);
				else point('Late application', dt.late, 'fee CHF 250, documents within two weeks');
				if (!s.done) point('Diploma at the latest', dt.diploma);
			} else point('Late application', dt.late, 'fee CHF 250');
			rows.push(['Invitation to enrol', 'from ' + dt.invite, '', '']);
		}
		return rows;
	}

	// Read-only hook so the logic can be checked outside the page.
	window.DH_APPLICATION = { datesFor, starts, checks, dateRows };

	// ---------- page ----------
	const $ = (id) => document.getElementById(id);
	const esc = (t) =>
		String(t).replace(
			/[&<>"]/g,
			(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
		);
	const ORIGIN = {
		bern: 'University of Bern',
		swiss: 'another Swiss university',
		swissfh: 'a Swiss FH / PH',
		intl: 'a university outside Switzerland'
	};
	const ROUTE = {
		bern: 'steps-bern',
		swiss: 'steps-swiss',
		swissfh: 'steps-swiss',
		intl: 'steps-intl'
	};

	function today() {
		const n = new Date();
		return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
	}

	// Copy a section of the page into the result without duplicating its ids.
	function copyOf(id) {
		const src = $(id);
		if (!src) return null;
		const c = src.cloneNode(true);
		c.removeAttribute('id');
		c.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
		return c;
	}

	function render(startList) {
		const f = $('ap-form'),
			t = today();
		const v = (name) => (f.querySelector(`input[name="${name}"]:checked`) || {}).value;
		const s = {
			origin: v('origin'),
			programme: v('programme'),
			basis: v('basis'),
			start: startList.find((x) => x.key === $('ap-start').value) || startList[0],
			done: f.elements.done.checked,
			visa: f.elements.visa.checked,
			de: f.elements.de.checked,
			en: f.elements.en.checked
		};

		$('ap-visa-wrap').style.display = s.origin === 'intl' ? '' : 'none';
		$('ap-title').textContent =
			`From ${ORIGIN[s.origin]} to the MA ${s.programme === 'major' ? 'Major' : 'Minor'} Digital Humanities, ${s.start.label}`;

		// problems first, then the verdict, then the details
		const order = { error: 0, warn: 1, ok: 2, info: 3 };
		$('ap-checks').innerHTML = checks(s, t)
			.sort((a, b) => order[a.level] - order[b.level])
			.map((x) => `<li class="ap-${x.level}">${esc(x.text)}</li>`)
			.join('');
		$('ap-dates').innerHTML = dateRows(s, t)
			.map(
				([label, text, cls, status]) =>
					`<div>${esc(label)}</div><div><span class="${cls}">${esc(text)}</span>${status ? ` <small class="${cls}">(${esc(status)})</small>` : ''}</div>`
			)
			.join('');

		const steps = $('ap-steps');
		steps.replaceChildren();
		const c = copyOf(ROUTE[s.origin]);
		if (c) steps.appendChild(c);
		const docs = $('ap-docs');
		docs.replaceChildren();
		if (s.origin === 'intl') {
			const h = document.createElement('h4');
			h.textContent = 'Documents to send';
			docs.appendChild(h);
			const dl = copyOf('docs-list-intl');
			if (dl) docs.appendChild(dl);
		}
	}

	function init() {
		if (!$('ap-root')) return;
		const list = starts(today());
		// Default to the next autumn start: the programme is designed to begin in the autumn.
		const autumn = list.find((x) => x.season === 'autumn') || list[0];
		$('ap-start').innerHTML = list
			.map(
				(x) => `<option value="${x.key}" ${x === autumn ? 'selected' : ''}>${esc(x.label)}</option>`
			)
			.join('');
		$('ap-form').addEventListener('change', () => render(list));
		$('ap-print').addEventListener('click', () => window.print());
		render(list);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
