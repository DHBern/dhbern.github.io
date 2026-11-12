// Course data for the semester planner (/teaching/planning/).
// Edit this file to add or change courses. Dates: YYYY-MM-DD, times: HH:MM.
//
// Each course:
//   id, title, kind (seminar | colloquium | lecture | course | workshop | meeting | online),
//   ects, semester (FS2027 | HS2027), lecturers, language, ksl,
//   block: introduction | advanced | reflection | theory | application | final | elective | none
//   programmes: which programmes the course counts for: ["major", "minor"]
//   weekly: { day: 1-5 (Mon-Fri), start, end, from, to, except: [dates] }   (optional)
//   dates:  [ { date, start, end, note } ]                                  (optional, single dates)
//   specialisations: ["editing" | "histories" | "culture" | "datascience" | "sociolinguistics"] (optional)
//   tba: text shown when dates/times are not fixed yet
//   url: link to course page

window.DH_SEMESTERS = {
  FS2027: {
    label: "Spring semester 2027",
    start: "2027-02-22", end: "2027-06-04",
    breaks: [{ from: "2027-03-26", to: "2027-04-04", label: "Easter break" }],
    holidays: ["2027-05-17"],
    season: "spring"
  },
  HS2027: {
    label: "Autumn semester 2027 (in development)",
    start: "2027-09-20", end: "2027-12-24",
    breaks: [],
    holidays: [],
    season: "autumn"
  }
};

window.DH_COURSES = [
  // ---------------- FS 2027 ----------------
  {
    id: "fs27-bots", specialisations: ["histories", "datascience"], semester: "FS2027", kind: "colloquium", ects: 3,
    title: "Building and Assessing Bots for Research in the Humanities",
    lecturers: "Tobias Hodel", language: "EN", ksl: "530331",
    block: "reflection", programmes: ["major", "minor"],
    weekly: { day: 1, start: "10:00", end: "12:00", from: "2027-03-08", to: "2027-05-31",
              except: ["2027-03-29", "2027-05-03", "2027-05-17"] },
    dates: [{ date: "2027-05-03", start: "09:00", end: "17:00", note: "full-day block (time tba)" }],
    url: "../fs2027/index.html#building-and-assessing-bots-for-research-in-the-humanities"
  },
  {
    id: "fs27-aarau", specialisations: ["histories", "culture"], semester: "FS2027", kind: "seminar", ects: 6,
    title: "Eine Stadt analysieren: Stadtgeschichte Aarau (Bild und Text)",
    lecturers: "Tobias Hodel", language: "DE", ksl: "530330",
    block: "elective", programmes: ["major", "minor"],
    dates: [
      { date: "2027-04-30", start: "10:15", end: "12:00", note: "online" },
      { date: "2027-05-07", start: "10:15", end: "12:00", note: "online" },
      { date: "2027-05-14", start: "09:30", end: "17:00", note: "Stadtmuseum Aarau" },
      { date: "2027-05-21", start: "09:30", end: "17:00", note: "Unitobler" },
      { date: "2027-05-28", start: "09:15", end: "13:30", note: "presentations" }
    ],
    url: "../fs2027/index.html#eine-stadt-analysieren-stadtgeschichte-aarau-bild-und-text"
  },
  {
    id: "fs27-atr", specialisations: ["editing", "histories"], semester: "FS2027", kind: "seminar", ects: 6,
    title: "Text Recognition: Dealing with Text Programmatically",
    lecturers: "Tobias Hodel", language: "EN", ksl: "530332",
    block: "elective", programmes: ["major", "minor"],
    weekly: { day: 3, start: "13:00", end: "17:00", from: "2027-04-07", to: "2027-06-02",
              except: ["2027-04-14", "2027-04-21"] },
    url: "../fs2027/index.html#text-recognition-dealing-with-text-programmatically"
  },
  {
    id: "fs27-beretta", specialisations: ["datascience", "histories"], semester: "FS2027", kind: "seminar", ects: 6,
    title: "From Information to Insights: Introduction to Data Analysis Using Open Data",
    lecturers: "Francesco Beretta", language: "tba", ksl: "",
    block: "elective", programmes: ["major", "minor"],
    weekly: { day: 2, start: "10:15", end: "12:00", from: "2027-02-23", to: "2027-06-01", except: [] },
    tba: "exact dates not yet in KSL",
    url: "../fs2027/index.html#from-information-to-insights-introduction-to-data-analysis-using-open-data"
  },
  {
    id: "fs27-borndigital", specialisations: ["culture", "histories"], semester: "FS2027", kind: "colloquium", ects: 3,
    title: "Research Perspectives on Born-Digital (Critical Algorithm Studies)",
    lecturers: "Moritz Mähr, Adrian Demleitner, Daniel Gammenthaler, Max Frischknecht", language: "tba", ksl: "",
    block: "reflection", programmes: ["major", "minor"],
    weekly: { day: 3, start: "14:00", end: "16:00", from: "2027-02-24", to: "2027-06-02", except: [] },
    tba: "Wednesday afternoon – exact time tba (14–16 assumed)",
    url: "../fs2027/index.html#research-perspectives-on-born-digital"
  },
  {
    id: "fs27-altsoc", specialisations: ["culture"], semester: "FS2027", kind: "workshop", ects: 0.5,
    title: "Alt-Soc (microcourse, with Digital In/Justice)",
    lecturers: "", language: "tba", ksl: "",
    block: "application", programmes: ["major"],
    tba: "one half day, date tba",
    url: "../fs2027/index.html#alt-soc"
  },
  {
    id: "fs27-intro-lecture", semester: "FS2027", kind: "online", ects: 3,
    title: "Digital Humanities — Introductions (online lecture)",
    lecturers: "17 lecturers", language: "EN/DE", ksl: "",
    block: "theory", programmes: ["major"],
    tba: "online, any time; exam and consultations tba",
    url: "/content/intro-lecture/"
  },
  {
    id: "fs27-programming", semester: "FS2027", kind: "course", ects: 3,
    title: "Introduction to programming (Grundkurs Programmieren)",
    lecturers: "Jakob Schärer, Lionel Stürmer", language: "DE", ksl: "ILIAS",
    block: "introduction", programmes: ["major", "minor"],
    weekly: { day: 5, start: "13:15", end: "15:00", from: "2027-02-26", to: "2027-06-04", except: [] },
    note: "can be followed fully online (podcast)",
    url: "https://www.digitale-nachhaltigkeit.unibe.ch/studium/grundkurs_programmieren/index_ger.html"
  },
  { id: "fs27-dm1", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[PPP] Data Management I: Active Research Data Management",
    lecturers: "Ursula Loosli, Gero Schreier", language: "EN", ksl: "515972", block: "application", programmes: ["major"],
    dates: [{ date: "2027-03-17", start: "09:00", end: "12:30" }], url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-dm2", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[PPP] Data Management II: Publishing Data",
    lecturers: "Ursula Loosli, Gero Schreier", language: "EN", ksl: "515974", block: "application", programmes: ["major"],
    dates: [{ date: "2027-03-17", start: "13:30", end: "17:00" }], url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-dm3", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Data Management III: Planning Research Data Management",
    lecturers: "Ursula Loosli, Gero Schreier", language: "EN", ksl: "515975", block: "application", programmes: ["major"],
    dates: [{ date: "2027-03-18", start: "09:00", end: "12:30" }], url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-iiif", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[PPP] Publishing and Re-using Images (IIIF)",
    lecturers: "Ursula Loosli", language: "EN", ksl: "516158", block: "application", programmes: ["major"],
    dates: [{ date: "2027-05-05", start: "09:00", end: "13:00" }], url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-oa2", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[PPP] Open Access II",
    lecturers: "Andrea Hacker-Heimhofer, Elio Pellin", language: "EN", ksl: "530408", block: "application", programmes: ["major"],
    tba: "date tba", url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-hermes", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Introduction to HERMES",
    lecturers: "", language: "EN", ksl: "530409", block: "application", programmes: ["major"],
    tba: "date tba", url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-km", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Knowledge Management",
    lecturers: "", language: "EN", ksl: "530410", block: "application", programmes: ["major"],
    tba: "date tba", url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-po", semester: "FS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Project Organization",
    lecturers: "", language: "EN", ksl: "530411", block: "application", programmes: ["major"],
    tba: "date tba", url: "../fs2027/index.html#applied-digital-humanities-workshops" },
  { id: "fs27-networking", semester: "FS2027", kind: "meeting", ects: 1, title: "Networking meeting and learning agreement",
    lecturers: "", language: "EN/DE", ksl: "", block: "application", programmes: ["major"],
    dates: [{ date: "2027-02-23", start: "15:00", end: "19:00", note: "place tba" }],
    url: "../fs2027/index.html#networking-meeting-application-module" },
  { id: "fs27-finalyear", semester: "FS2027", kind: "meeting", ects: 0, title: "Final-year meetings and presentations",
    lecturers: "Course team", language: "EN/DE", ksl: "", block: "final", programmes: ["major", "minor"],
    dates: [
      { date: "2027-03-16", start: "16:00", end: "17:15", note: "progress report, D222" },
      { date: "2027-04-20", start: "12:00", end: "13:00", note: "status report" },
      { date: "2027-06-01", start: "14:00", end: "17:15", note: "final presentations, D222" }
    ],
    url: "../fs2027/index.html#final-year-and-doctoral-programme" },

  // ---------------- HS 2027 (in development) ----------------
  {
    id: "hs27-intro", semester: "HS2027", kind: "course", ects: 3,
    title: "Introduction to Digital Humanities",
    lecturers: "Course team", language: "EN", ksl: "",
    block: "introduction", programmes: ["major", "minor"],
    weekly: { day: 2, start: "10:15", end: "12:00", from: "2027-09-21", to: "2027-12-21", except: [] },
    url: "https://dhbern.github.io/introduction-to-dh/"
  },
  {
    id: "hs27-lab", semester: "HS2027", kind: "course", ects: 4,
    title: "DH Lab",
    lecturers: "Course team", language: "EN", ksl: "",
    block: "introduction", programmes: ["major", "minor"],
    weekly: { day: 2, start: "14:00", end: "17:15", from: "2027-09-21", to: "2027-12-21", except: [] },
    url: "https://dhbern.github.io/dh-lab/"
  },
  {
    id: "hs27-lectureseries", semester: "HS2027", kind: "lecture", ects: 3,
    title: "Lecture series: Insights into the Digital Humanities",
    lecturers: "various", language: "DE/EN", ksl: "",
    block: "introduction", programmes: ["major", "minor"],
    weekly: { day: 1, start: "14:00", end: "16:00", from: "2027-09-20", to: "2027-12-13", except: [] },
    note: "workshops 16:00–18:00 on selected dates",
    url: "https://dhbern.github.io/dh-lecture-series/"
  },
  {
    id: "hs27-programming", semester: "HS2027", kind: "course", ects: 3,
    title: "Introduction to programming (Grundkurs Programmieren)",
    lecturers: "Jakob Schärer, Lionel Stürmer", language: "DE", ksl: "ILIAS",
    block: "introduction", programmes: ["major", "minor"],
    weekly: { day: 5, start: "13:15", end: "15:00", from: "2027-09-24", to: "2027-12-17", except: [] },
    note: "can be followed fully online (podcast)",
    url: "https://www.digitale-nachhaltigkeit.unibe.ch/studium/grundkurs_programmieren/index_ger.html"
  },
  { id: "hs27-finalyear", semester: "HS2027", kind: "meeting", ects: 0, title: "Final-year meetings and presentations (in the DH Lab)",
    lecturers: "Course team", language: "EN", ksl: "", block: "final", programmes: ["major", "minor"],
    dates: [
      { date: "2027-10-05", start: "16:00", end: "17:15", note: "project report (proposed)" },
      { date: "2027-11-09", start: "16:00", end: "17:15", note: "status report (proposed)" },
      { date: "2027-12-21", start: "14:00", end: "17:15", note: "final presentations (proposed)" }
    ],
    url: "../hs2027/index.html#final-year" },
  { id: "hs27-ws-pm", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Introduction to Project Management",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-github", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[ProjM] GitHub as a Project Management Tool",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-cycle", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Research Cycle",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-time", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[ProjM] Time and Resources Management",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-oa1", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[PPP] Open Access I",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-jupyter", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[PPP] Jupyter Notebooks: Executing Code",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" },
  { id: "hs27-ws-web1", semester: "HS2027", kind: "workshop", ects: 0.5, title: "[PPP] Web-Basics I (online)",
    lecturers: "", language: "EN", ksl: "", block: "application", programmes: ["major"], tba: "date tba",
    url: "../hs2027/index.html#applied-digital-humanities-workshops-application-major" }
];

// Specialisations of the Major. Courses carry a "specialisations" list where they fit one;
// courses without the list are general (count for every specialisation).
// The assignment of courses to specialisations is a first proposal – please check.
window.DH_SPECIALISATIONS = {
  editing: "Digital Scholarly Editing and Computational Literary Studies",
  histories: "Digital Histories",
  culture: "Digital Culture Studies",
  datascience: "Data Science",
  sociolinguistics: "Digital Sociolinguistics"
};

// Recommended study semester per block (from the study plan on /teaching/).
window.DH_RULES = {
  major: { introduction: 1, theory: 2, advanced: 2, reflection: 2, elective: 2, application: 3, final: 4 },
  minor: { introduction: 1, advanced: 2, reflection: 2, elective: 2, final: 3 }
};
