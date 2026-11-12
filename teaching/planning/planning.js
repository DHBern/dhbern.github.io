// Semester planner for /teaching/planning/ – runs entirely in the browser.
(function () {
  "use strict";

  const SEM = window.DH_SEMESTERS, COURSES = window.DH_COURSES, RULES = window.DH_RULES;
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const KIND_LABEL = { seminar: "Seminar", colloquium: "Colloquium", lecture: "Lecture", course: "Course",
    workshop: "Workshop", meeting: "Meeting", online: "Online lecture" };
  const BLOCK_LABEL = { introduction: "Introduction", theory: "Theories, approaches & solutions",
    advanced: "Advanced studies", reflection: "Reflection", elective: "Elective seminar",
    application: "Application", final: "Final phase", none: "–" };
  const STORE = "dh-teaching-planner-v1";

  // ---------- state ----------
  let state = { semester: "FS2027", programme: "major", studySem: 2, introDone: true,
    selected: {}, q: "", kind: "", block: "", onlyMine: true, week: 0 };
  try { const s = JSON.parse(localStorage.getItem(STORE) || "null"); if (s) state = Object.assign(state, s); } catch (e) {}
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const parse = (d) => { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
  const iso = (dt) => dt.toISOString().slice(0, 10);
  const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmtDate = (d) => parse(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const addDays = (dt, n) => new Date(dt.getTime() + n * 86400000);
  const sel = () => (state.selected[state.semester] = state.selected[state.semester] || []);

  function inBreak(semKey, d) {
    const s = SEM[semKey];
    if (s.holidays.includes(d)) return true;
    return s.breaks.some((b) => d >= b.from && d <= b.to);
  }

  // Expand a course into concrete sessions {date, start, end, note}
  function sessions(c) {
    const out = [];
    if (c.weekly) {
      const w = c.weekly; let dt = parse(w.from); const end = parse(w.to);
      while (dt.getUTCDay() !== w.day) dt = addDays(dt, 1);
      for (; dt <= end; dt = addDays(dt, 7)) {
        const d = iso(dt);
        if ((w.except || []).includes(d) || inBreak(c.semester, d)) continue;
        out.push({ date: d, start: w.start, end: w.end, note: "" });
      }
    }
    (c.dates || []).forEach((x) => out.push({ date: x.date, start: x.start, end: x.end, note: x.note || "" }));
    return out.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }

  function counts(c) { return (c.programmes || []).includes(state.programme); }

  // ---------- checks ----------
  function checks() {
    const chosen = COURSES.filter((c) => sel().includes(c.id));
    const out = []; // {level: error|warn|info, text}
    const s = SEM[state.semester];
    const prog = state.programme, sem = Number(state.studySem);
    const rules = RULES[prog];

    // 1. overlaps
    const all = [];
    chosen.forEach((c) => sessions(c).forEach((x) => all.push(Object.assign({ c }, x))));
    const pairs = {};
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      if (a.c.id === b.c.id || a.date !== b.date) continue;
      if (mins(a.start) < mins(b.end) && mins(b.start) < mins(a.end)) {
        const k = [a.c.id, b.c.id].sort().join("|");
        (pairs[k] = pairs[k] || { a: a.c, b: b.c, dates: [] }).dates.push(a.date);
      }
    }
    Object.values(pairs).forEach((p) => out.push({ level: "error",
      text: `<b>Overlap:</b> ${esc(p.a.title)} and ${esc(p.b.title)} on ${p.dates.length} date(s): ${p.dates.slice(0, 4).map(fmtDate).join(", ")}${p.dates.length > 4 ? " …" : ""}` }));

    // 2. season of the study semester
    const expectedSeason = (sem % 2 === 1) ? "autumn" : "spring";
    if (s.season !== expectedSeason)
      out.push({ level: "info", text: `In the study plan, your ${sem}. semester is an <b>${expectedSeason}</b> semester. You are planning a ${s.season} semester – check the order of your blocks with the head of study programmes.` });

    // 3. per course: programme, too early, final phase
    chosen.forEach((c) => {
      if (!counts(c))
        out.push({ level: "warn", text: `<b>${esc(c.title)}</b> does not count towards the ${prog === "major" ? "Major" : "Minor"}.` });
      const rec = rules[c.block];
      if (rec && sem < rec) {
        const lvl = (c.block === "elective" || c.kind === "workshop") ? "info" : "warn";
        out.push({ level: lvl, text: `<b>${esc(c.title)}</b> (${BLOCK_LABEL[c.block]}) is planned for semester ${rec}; you are in semester ${sem} – ${c.block === "final" ? "final-year meetings are for your last semester" : "taken too early"}.` });
      }
      if (["advanced", "reflection", "elective", "theory", "application"].includes(c.block) && !state.introDone && sem > 1)
        out.push({ level: "warn", text: `<b>${esc(c.title)}</b>: complete the Introduction block (Intro to DH, DH Lab, programming, lecture series) first.` });
      if (c.tba) out.push({ level: "info", text: `<b>${esc(c.title)}</b>: ${esc(c.tba)}.` });
    });

    // 4. first semester essentials
    if (sem === 1) {
      if (s.season === "spring")
        out.push({ level: "warn", text: "The programmes start in the <b>autumn</b>: Introduction to DH, DH Lab and the lecture series are only taught then." });
      else ["hs27-intro", "hs27-lab"].forEach((id) => {
        if (!sel().includes(id)) { const c = COURSES.find((x) => x.id === id); if (c) out.push({ level: "warn", text: `First semester: add <b>${esc(c.title)}</b> (compulsory).` }); }
      });
    }

    // 5. workload
    const ects = chosen.reduce((t, c) => t + (counts(c) ? c.ects : 0), 0);
    if (ects > 30) out.push({ level: "warn", text: `You have planned ${ects} ECTS that count for your programme – more than a full-time semester (30 ECTS).` });

    return { list: out, ects, chosen, overlaps: pairs };
  }

  // ---------- rendering ----------
  function renderControls() {
    $("pl-semester").innerHTML = Object.entries(SEM).map(([k, v]) => `<option value="${k}" ${k === state.semester ? "selected" : ""}>${esc(v.label)}</option>`).join("");
    $("pl-programme").value = state.programme;
    $("pl-studysem").value = String(state.studySem);
    $("pl-introdone").checked = !!state.introDone;
    $("pl-q").value = state.q; $("pl-kind").value = state.kind; $("pl-block").value = state.block;
    $("pl-onlymine").checked = !!state.onlyMine;
  }

  function renderList() {
    const q = state.q.toLowerCase();
    const items = COURSES.filter((c) => c.semester === state.semester)
      .filter((c) => !state.kind || c.kind === state.kind)
      .filter((c) => !state.block || c.block === state.block)
      .filter((c) => !state.onlyMine || counts(c))
      .filter((c) => !q || (c.title + " " + c.lecturers + " " + (c.ksl || "")).toLowerCase().includes(q));
    $("pl-count").textContent = `${items.length} course(s)`;
    $("pl-list").innerHTML = items.map((c) => {
      const on = sel().includes(c.id);
      const ss = sessions(c);
      const when = c.weekly ? `${DAYS[c.weekly.day - 1]} ${c.weekly.start}–${c.weekly.end}, ${ss.filter((x) => !x.note).length} sessions` :
        ss.length ? ss.map((x) => `${fmtDate(x.date)} ${x.start}–${x.end}`).slice(0, 3).join("; ") + (ss.length > 3 ? " …" : "") : (c.tba || "tba");
      return `<div class="pl-item ${on ? "on" : ""}">
        <div class="pl-item-main">
          <div class="pl-item-title"><a href="${esc(c.url || "#")}">${esc(c.title)}</a></div>
          <div class="pl-item-meta">${KIND_LABEL[c.kind] || c.kind} · ${c.ects} ECTS · ${BLOCK_LABEL[c.block] || ""}${c.lecturers ? " · " + esc(c.lecturers) : ""}${c.language ? " · " + esc(c.language) : ""}${c.ksl ? " · KSL " + esc(c.ksl) : ""}</div>
          <div class="pl-item-when">${esc(when)}${c.note ? " · " + esc(c.note) : ""}${!counts(c) ? ' · <span class="pl-tag-warn">not in your programme</span>' : ""}</div>
        </div>
        <button class="btn btn-sm ${on ? "btn-outline-danger" : "btn-outline-primary"}" data-id="${c.id}">${on ? "Remove" : "Add"}</button>
      </div>`;
    }).join("") || "<p>No courses match.</p>";
    $("pl-list").querySelectorAll("button[data-id]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.id)));
  }

  function weekStarts() {
    const s = SEM[state.semester]; const out = [];
    let dt = parse(s.start); while (dt.getUTCDay() !== 1) dt = addDays(dt, -1);
    for (; dt <= parse(s.end); dt = addDays(dt, 7)) out.push(dt);
    return out;
  }

  function renderCalendar(res) {
    const weeks = weekStarts();
    state.week = Math.max(0, Math.min(state.week, weeks.length - 1));
    const ws = weeks[state.week]; const we = addDays(ws, 4);
    const brk = SEM[state.semester].breaks.find((b) => iso(ws) <= b.to && iso(we) >= b.from);
    $("pl-weeklabel").textContent = `Week ${state.week + 1} of ${weeks.length}: ${fmtDate(iso(ws))} – ${fmtDate(iso(we))}${brk ? " · " + brk.label : ""}`;

    const H0 = 8 * 60, H1 = 19 * 60, PX = 0.8; // px per minute
    const conflictKeys = new Set();
    Object.values(res.overlaps).forEach((p) => p.dates.forEach((d) => { conflictKeys.add(p.a.id + d); conflictKeys.add(p.b.id + d); }));

    let html = `<div class="pl-grid" style="height:${(H1 - H0) * PX + 24}px">`;
    html += `<div class="pl-hours">` + Array.from({ length: 12 }, (_, i) => `<div style="top:${(i * 60) * PX + 24}px">${String(8 + i).padStart(2, "0")}:00</div>`).join("") + `</div>`;
    for (let d = 0; d < 5; d++) {
      const date = iso(addDays(ws, d));
      const off = inBreak(state.semester, date);
      html += `<div class="pl-day ${off ? "off" : ""}"><div class="pl-dayhead">${fmtDate(date)}</div>`;
      for (let i = 0; i < 11; i++) html += `<div class="pl-line" style="top:${(i + 1) * 60 * PX + 24}px"></div>`;
      const todays = [];
      res.chosen.forEach((c) => sessions(c).filter((x) => x.date === date).forEach((x) => todays.push({ c, x })));
      todays.sort((a, b) => mins(a.x.start) - mins(b.x.start));
      // simple column layout for overlapping blocks
      const cols = [];
      todays.forEach((t) => {
        let k = 0; while (cols[k] && cols[k] > mins(t.x.start)) k++;
        cols[k] = mins(t.x.end); t.col = k;
      });
      const n = Math.max(1, cols.length);
      todays.forEach((t) => {
        const top = (Math.max(mins(t.x.start), H0) - H0) * PX + 24;
        const h = Math.max(18, (Math.min(mins(t.x.end), H1) - Math.max(mins(t.x.start), H0)) * PX);
        const bad = conflictKeys.has(t.c.id + date);
        html += `<div class="pl-ev ${bad ? "bad" : ""} k-${t.c.kind}" style="top:${top}px;height:${h}px;left:${(t.col / n) * 100}%;width:${100 / n}%" title="${esc(t.c.title)} ${t.x.start}–${t.x.end} ${esc(t.x.note)}">
          <b>${t.x.start}–${t.x.end}</b> ${esc(t.c.title)}${t.x.note ? `<br><i>${esc(t.x.note)}</i>` : ""}</div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    $("pl-cal").innerHTML = html;
  }

  function renderChecks(res) {
    $("pl-ects").textContent = `${res.ects} ECTS planned (${res.chosen.length} item(s))`;
    const order = { error: 0, warn: 1, info: 2 };
    const list = res.list.sort((a, b) => order[a.level] - order[b.level]);
    $("pl-checks").innerHTML = list.length ? list.map((x) => `<li class="pl-${x.level}">${x.text}</li>`).join("")
      : (res.chosen.length ? '<li class="pl-ok">No overlaps or problems found.</li>' : "<li>Add courses to see checks.</li>");
    const tba = res.chosen.filter((c) => !sessions(c).length);
    $("pl-tba").innerHTML = tba.length ? "<b>Without fixed dates (not in the calendar):</b> " + tba.map((c) => esc(c.title)).join(" · ") : "";
  }

  function render() {
    renderControls(); renderList();
    const res = checks(); renderChecks(res); renderCalendar(res); save();
  }

  function toggle(id) {
    const s = sel(); const i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1); else s.push(id);
    render();
  }

  function init() {
    if (!$("pl-root")) return;
    $("pl-semester").addEventListener("change", (e) => { state.semester = e.target.value; state.week = 0; render(); });
    $("pl-programme").addEventListener("change", (e) => { state.programme = e.target.value; render(); });
    $("pl-studysem").addEventListener("change", (e) => { state.studySem = Number(e.target.value); render(); });
    $("pl-introdone").addEventListener("change", (e) => { state.introDone = e.target.checked; render(); });
    $("pl-q").addEventListener("input", (e) => { state.q = e.target.value; renderList(); save(); });
    $("pl-kind").addEventListener("change", (e) => { state.kind = e.target.value; render(); });
    $("pl-block").addEventListener("change", (e) => { state.block = e.target.value; render(); });
    $("pl-onlymine").addEventListener("change", (e) => { state.onlyMine = e.target.checked; render(); });
    $("pl-prev").addEventListener("click", () => { state.week--; render(); });
    $("pl-next").addEventListener("click", () => { state.week++; render(); });
    $("pl-firstconflict").addEventListener("click", () => {
      const res = checks(); const ds = Object.values(res.overlaps).flatMap((p) => p.dates).sort();
      if (!ds.length) return;
      const weeks = weekStarts(); const d = parse(ds[0]);
      state.week = weeks.findIndex((w) => d >= w && d < addDays(w, 7)); render();
    });
    $("pl-clear").addEventListener("click", () => { state.selected[state.semester] = []; render(); });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
