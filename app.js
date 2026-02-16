/* =========================
   CV Maker Pro (No backend)
   ========================= */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "cv_maker_pro_v1";

const els = {
  // Controls
  templateSelect: $("templateSelect"),
  accentColor: $("accentColor"),
  fontSelect: $("fontSelect"),
  photoToggle: $("photoToggle"),

  // Buttons
  btnDownload: $("btnDownload"),
  btnExport: $("btnExport"),
  btnReset: $("btnReset"),
  importFile: $("importFile"),

  // Photo
  photoInput: $("photoInput"),
  photoPreview: $("photoPreview"),
  photoFallback: $("photoFallback"),
  btnRemovePhoto: $("btnRemovePhoto"),

  // Personal
  fullName: $("fullName"),
  jobTitle: $("jobTitle"),
  phone: $("phone"),
  email: $("email"),
  location: $("location"),
  link: $("link"),

  summary: $("summary"),

  // Skills
  skillInput: $("skillInput"),
  btnAddSkill: $("btnAddSkill"),
  skillsWrap: $("skillsWrap"),

  // Lists
  sectionOrder: $("sectionOrder"),
  expList: $("expList"),
  eduList: $("eduList"),
  projList: $("projList"),
  certList: $("certList"),

  referees: $("referees"),

  // Preview
  cv: $("cv"),
};

// ---------- State ----------
const defaultState = () => ({
  meta: {
    template: "modern-1",
    accent: "#2563eb",
    font: "inter",
    photoMode: "on",
  },
  photoDataUrl: "",
  personal: {
    fullName: "Your Name",
    jobTitle: "Customer Service Representative",
    phone: "+254 7xx xxx xxx",
    email: "email@example.com",
    location: "Nairobi, Kenya",
    link: "",
  },
  summary:
    "Hardworking and reliable professional with strong communication skills and the ability to work under pressure. Seeking a role where I can grow and contribute to a strong team.",
  skills: ["Communication", "Customer Service", "Microsoft Excel", "Time Management"],
  experience: [
    {
      id: crypto.randomUUID(),
      role: "Customer Service Assistant",
      company: "ABC Shop",
      location: "Nairobi",
      start: "2023",
      end: "2025",
      bullets: [
        "Served customers and handled cash transactions.",
        "Resolved customer complaints professionally.",
        "Helped increase daily sales through upselling.",
      ],
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      course: "KCSE",
      school: "XYZ High School",
      location: "Kenya",
      start: "2019",
      end: "2022",
      bullets: ["Completed KCSE with strong performance."],
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "CV Maker Website",
      link: "",
      year: "2026",
      bullets: [
        "Built a CV maker using HTML, CSS, and JavaScript.",
        "Implemented PDF export and multiple templates.",
      ],
    },
  ],
  certs: [
    {
      id: crypto.randomUUID(),
      name: "Google Digital Skills for Africa",
      issuer: "Google",
      year: "2025",
    },
  ],
  referees: "",
  sectionOrder: ["summary", "skills", "experience", "education", "projects", "certs", "referees"],
});

let state = loadState() || defaultState();

// ---------- Utilities ----------
function safeText(v, fallback = "") {
  const s = (v ?? "").toString().trim();
  return s.length ? s : fallback;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setAccent(color) {
  document.documentElement.style.setProperty("--accent", color);
}

function setFont(fontKey) {
  els.cv.classList.remove("font-inter", "font-system", "font-georgia", "font-mono");
  if (fontKey === "system") els.cv.classList.add("font-system");
  else if (fontKey === "georgia") els.cv.classList.add("font-georgia");
  else if (fontKey === "mono") els.cv.classList.add("font-mono");
  else els.cv.classList.add("font-inter");
}

function setTemplate(tpl) {
  els.cv.classList.remove(
    "template-modern-1",
    "template-modern-2",
    "template-modern-3",
    "template-ats-1",
    "template-ats-2",
    "template-ats-3"
  );

  const map = {
    "modern-1": "template-modern-1",
    "modern-2": "template-modern-2",
    "modern-3": "template-modern-3",
    "ats-1": "template-ats-1",
    "ats-2": "template-ats-2",
    "ats-3": "template-ats-3",
  };

  els.cv.classList.add(map[tpl] || "template-modern-1");
}

function isModernTemplate(tpl) {
  return tpl.startsWith("modern");
}

function fmtRange(start, end) {
  const a = safeText(start, "");
  const b = safeText(end, "");
  if (!a && !b) return "";
  if (a && !b) return `${a} - Present`;
  if (!a && b) return b;
  return `${a} - ${b}`;
}

// ---------- Rendering small UI pieces ----------
function renderSkillsBuilder() {
  els.skillsWrap.innerHTML = "";
  for (const s of state.skills) {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `
      <span>${escapeHtml(s)}</span>
      <button title="Remove">✕</button>
    `;
    tag.querySelector("button").addEventListener("click", () => {
      state.skills = state.skills.filter(x => x !== s);
      saveState();
      renderAll();
    });
    els.skillsWrap.appendChild(tag);
  }
}

function renderSectionOrder() {
  const names = {
    summary: "Summary",
    skills: "Skills",
    experience: "Work Experience",
    education: "Education",
    projects: "Projects",
    certs: "Certifications",
    referees: "Referees",
  };

  els.sectionOrder.innerHTML = "";

  state.sectionOrder.forEach((key, idx) => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div class="name">${names[key] || key}</div>
      <div class="btns">
        <button class="btn mini" ${idx === 0 ? "disabled" : ""}>↑</button>
        <button class="btn mini" ${idx === state.sectionOrder.length - 1 ? "disabled" : ""}>↓</button>
      </div>
    `;

    const [upBtn, downBtn] = row.querySelectorAll("button");
    upBtn.addEventListener("click", () => {
      if (idx === 0) return;
      const arr = [...state.sectionOrder];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      state.sectionOrder = arr;
      saveState();
      renderAll();
    });

    downBtn.addEventListener("click", () => {
      if (idx === state.sectionOrder.length - 1) return;
      const arr = [...state.sectionOrder];
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      state.sectionOrder = arr;
      saveState();
      renderAll();
    });

    els.sectionOrder.appendChild(row);
  });
}

// ---------- Cards renderers ----------
function renderExperienceCards() {
  els.expList.innerHTML = "";
  for (const job of state.experience) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(job.role || "New Job")}</div>
        <div class="card-actions">
          <button class="btn mini danger">Delete</button>
        </div>
      </div>

      <div class="card-grid">
        <div class="field">
          <label>Role</label>
          <input data-k="role" value="${escapeAttr(job.role)}" />
        </div>
        <div class="field">
          <label>Company</label>
          <input data-k="company" value="${escapeAttr(job.company)}" />
        </div>

        <div class="field">
          <label>Location</label>
          <input data-k="location" value="${escapeAttr(job.location)}" />
        </div>
        <div class="field">
          <label>Start Year</label>
          <input data-k="start" value="${escapeAttr(job.start)}" />
        </div>

        <div class="field">
          <label>End Year</label>
          <input data-k="end" value="${escapeAttr(job.end)}" />
        </div>

        <div class="field full">
          <label>Bullet Points</label>
          <div class="bullets"></div>
          <button class="btn mini" data-add-bullet>+ Add Bullet</button>
        </div>
      </div>
    `;

    // delete
    card.querySelector(".danger").addEventListener("click", () => {
      state.experience = state.experience.filter(x => x.id !== job.id);
      saveState();
      renderAll();
    });

    // inputs
    card.querySelectorAll("input[data-k]").forEach(inp => {
      inp.addEventListener("input", () => {
        job[inp.dataset.k] = inp.value;
        saveState();
        renderPreview();
        // keep title updated
        card.querySelector(".card-title").textContent = safeText(job.role, "New Job");
      });
    });

    // bullets
    const bulletsWrap = card.querySelector(".bullets");
    const renderBullets = () => {
      bulletsWrap.innerHTML = "";
      job.bullets = job.bullets || [];

      job.bullets.forEach((b, i) => {
        const row = document.createElement("div");
        row.className = "bullet-row";
        row.innerHTML = `
          <input value="${escapeAttr(b)}" />
          <button class="btn mini danger" title="Remove">✕</button>
        `;
        const [input, del] = row.querySelectorAll("input,button");
        input.addEventListener("input", () => {
          job.bullets[i] = input.value;
          saveState();
          renderPreview();
        });
        del.addEventListener("click", () => {
          job.bullets.splice(i, 1);
          saveState();
          renderBullets();
          renderPreview();
        });
        bulletsWrap.appendChild(row);
      });
    };
    renderBullets();

    card.querySelector("[data-add-bullet]").addEventListener("click", () => {
      job.bullets.push("New achievement...");
      saveState();
      renderBullets();
      renderPreview();
    });

    els.expList.appendChild(card);
  }
}

function renderEducationCards() {
  els.eduList.innerHTML = "";
  for (const edu of state.education) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(edu.course || "New Education")}</div>
        <div class="card-actions">
          <button class="btn mini danger">Delete</button>
        </div>
      </div>

      <div class="card-grid">
        <div class="field">
          <label>Course / Qualification</label>
          <input data-k="course" value="${escapeAttr(edu.course)}" />
        </div>
        <div class="field">
          <label>School</label>
          <input data-k="school" value="${escapeAttr(edu.school)}" />
        </div>

        <div class="field">
          <label>Location</label>
          <input data-k="location" value="${escapeAttr(edu.location)}" />
        </div>
        <div class="field">
          <label>Start Year</label>
          <input data-k="start" value="${escapeAttr(edu.start)}" />
        </div>

        <div class="field">
          <label>End Year</label>
          <input data-k="end" value="${escapeAttr(edu.end)}" />
        </div>

        <div class="field full">
          <label>Highlights (optional)</label>
          <div class="bullets"></div>
          <button class="btn mini" data-add-bullet>+ Add Highlight</button>
        </div>
      </div>
    `;

    card.querySelector(".danger").addEventListener("click", () => {
      state.education = state.education.filter(x => x.id !== edu.id);
      saveState();
      renderAll();
    });

    card.querySelectorAll("input[data-k]").forEach(inp => {
      inp.addEventListener("input", () => {
        edu[inp.dataset.k] = inp.value;
        saveState();
        renderPreview();
        card.querySelector(".card-title").textContent = safeText(edu.course, "New Education");
      });
    });

    const bulletsWrap = card.querySelector(".bullets");
    const renderBullets = () => {
      bulletsWrap.innerHTML = "";
      edu.bullets = edu.bullets || [];
      edu.bullets.forEach((b, i) => {
        const row = document.createElement("div");
        row.className = "bullet-row";
        row.innerHTML = `
          <input value="${escapeAttr(b)}" />
          <button class="btn mini danger" title="Remove">✕</button>
        `;
        const [input, del] = row.querySelectorAll("input,button");
        input.addEventListener("input", () => {
          edu.bullets[i] = input.value;
          saveState();
          renderPreview();
        });
        del.addEventListener("click", () => {
          edu.bullets.splice(i, 1);
          saveState();
          renderBullets();
          renderPreview();
        });
        bulletsWrap.appendChild(row);
      });
    };
    renderBullets();

    card.querySelector("[data-add-bullet]").addEventListener("click", () => {
      edu.bullets.push("Achievement / grade / leadership...");
      saveState();
      renderBullets();
      renderPreview();
    });

    els.eduList.appendChild(card);
  }
}

function renderProjectCards() {
  els.projList.innerHTML = "";
  for (const p of state.projects) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(p.name || "New Project")}</div>
        <div class="card-actions">
          <button class="btn mini danger">Delete</button>
        </div>
      </div>

      <div class="card-grid">
        <div class="field">
          <label>Project Name</label>
          <input data-k="name" value="${escapeAttr(p.name)}" />
        </div>
        <div class="field">
          <label>Year</label>
          <input data-k="year" value="${escapeAttr(p.year)}" />
        </div>

        <div class="field full">
          <label>Link (optional)</label>
          <input data-k="link" value="${escapeAttr(p.link)}" />
        </div>

        <div class="field full">
          <label>Bullet Points</label>
          <div class="bullets"></div>
          <button class="btn mini" data-add-bullet>+ Add Bullet</button>
        </div>
      </div>
    `;

    card.querySelector(".danger").addEventListener("click", () => {
      state.projects = state.projects.filter(x => x.id !== p.id);
      saveState();
      renderAll();
    });

    card.querySelectorAll("input[data-k]").forEach(inp => {
      inp.addEventListener("input", () => {
        p[inp.dataset.k] = inp.value;
        saveState();
        renderPreview();
        card.querySelector(".card-title").textContent = safeText(p.name, "New Project");
      });
    });

    const bulletsWrap = card.querySelector(".bullets");
    const renderBullets = () => {
      bulletsWrap.innerHTML = "";
      p.bullets = p.bullets || [];
      p.bullets.forEach((b, i) => {
        const row = document.createElement("div");
        row.className = "bullet-row";
        row.innerHTML = `
          <input value="${escapeAttr(b)}" />
          <button class="btn mini danger" title="Remove">✕</button>
        `;
        const [input, del] = row.querySelectorAll("input,button");
        input.addEventListener("input", () => {
          p.bullets[i] = input.value;
          saveState();
          renderPreview();
        });
        del.addEventListener("click", () => {
          p.bullets.splice(i, 1);
          saveState();
          renderBullets();
          renderPreview();
        });
        bulletsWrap.appendChild(row);
      });
    };
    renderBullets();

    card.querySelector("[data-add-bullet]").addEventListener("click", () => {
      p.bullets.push("What you built / impact / tech...");
      saveState();
      renderBullets();
      renderPreview();
    });

    els.projList.appendChild(card);
  }
}

function renderCertCards() {
  els.certList.innerHTML = "";
  for (const c of state.certs) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(c.name || "New Certification")}</div>
        <div class="card-actions">
          <button class="btn mini danger">Delete</button>
        </div>
      </div>

      <div class="card-grid">
        <div class="field">
          <label>Name</label>
          <input data-k="name" value="${escapeAttr(c.name)}" />
        </div>
        <div class="field">
          <label>Issuer</label>
          <input data-k="issuer" value="${escapeAttr(c.issuer)}" />
        </div>
        <div class="field">
          <label>Year</label>
          <input data-k="year" value="${escapeAttr(c.year)}" />
        </div>
      </div>
    `;

    card.querySelector(".danger").addEventListener("click", () => {
      state.certs = state.certs.filter(x => x.id !== c.id);
      saveState();
      renderAll();
    });

    card.querySelectorAll("input[data-k]").forEach(inp => {
      inp.addEventListener("input", () => {
        c[inp.dataset.k] = inp.value;
        saveState();
        renderPreview();
        card.querySelector(".card-title").textContent = safeText(c.name, "New Certification");
      });
    });

    els.certList.appendChild(card);
  }
}

// ---------- Preview render ----------
function renderPreview() {
  setAccent(state.meta.accent);
  setFont(state.meta.font);
  setTemplate(state.meta.template);

  // Build ordered sections
  const sections = {};
  sections.summary = buildSummarySection();
  sections.skills = buildSkillsSection();
  sections.experience = buildExperienceSection();
  sections.education = buildEducationSection();
  sections.projects = buildProjectsSection();
  sections.certs = buildCertsSection();
  sections.referees = buildRefereesSection();

  const ordered = state.sectionOrder
    .map(k => sections[k])
    .filter(Boolean)
    .filter(s => s.trim().length > 0);

  const header = buildHeader();

  // Template layouts
  const tpl = state.meta.template;

  if (tpl === "modern-1") {
    els.cv.innerHTML = `
      <div class="left">
        ${buildPhotoBlock("square")}
        <div class="accent"></div>
        ${buildContactBlock("left")}
        ${ordered.filter(s => s.includes('data-sec="skills"') || s.includes('data-sec="certs"') || s.includes('data-sec="referees"')).join("")}
      </div>
      <div class="right">
        ${header}
        ${ordered.filter(s => !s.includes('data-sec="skills"') && !s.includes('data-sec="certs"') && !s.includes('data-sec="referees"')).join("")}
      </div>
    `;
    return;
  }

  if (tpl === "modern-2") {
    els.cv.innerHTML = `
      <div class="header">
        <div class="header-row">
          <div>
            ${header}
            ${buildContactBlock("row")}
          </div>
          ${buildPhotoBlock("circle")}
        </div>
      </div>
      <div class="body">
        ${ordered.join("")}
      </div>
    `;
    return;
  }

  if (tpl === "modern-3") {
    els.cv.innerHTML = `
      <div class="header">
        ${header}
        <div class="hr"></div>
        ${buildContactBlock("row")}
      </div>
      <div class="body">
        <div class="cardbox">${ordered.join("")}</div>
      </div>
    `;
    return;
  }

  if (tpl === "ats-1") {
    els.cv.innerHTML = `
      <div class="header">
        ${header}
        <div class="hr"></div>
        ${buildContactBlock("row")}
      </div>
      <div class="body">
        ${ordered.join("")}
      </div>
    `;
    return;
  }

  if (tpl === "ats-2") {
    els.cv.innerHTML = `
      <div class="header">
        ${header}
        ${buildContactBlock("row")}
      </div>
      <div class="body">
        ${ordered.join("")}
      </div>
    `;
    return;
  }

  if (tpl === "ats-3") {
    // ATS 3: side for skills/certs, main for rest
    const side = ordered.filter(s => s.includes('data-sec="skills"') || s.includes('data-sec="certs"')).join("");
    const main = ordered.filter(s => !s.includes('data-sec="skills"') && !s.includes('data-sec="certs"')).join("");

    els.cv.innerHTML = `
      <div class="main">
        ${header}
        <div class="hr"></div>
        ${buildContactBlock("row")}
        ${main}
      </div>
      <div class="side">
        ${buildPhotoBlock("square")}
        ${side}
      </div>
    `;
    return;
  }

  // fallback
  els.cv.innerHTML = `
    <div class="header">
      ${header}
      <div class="hr"></div>
      ${buildContactBlock("row")}
    </div>
    <div class="body">${ordered.join("")}</div>
  `;
}

function buildHeader() {
  const p = state.personal;
  return `
    <div class="sec" style="padding:0; margin:0;">
      <h1>${escapeHtml(safeText(p.fullName, "Your Name"))}</h1>
      <div class="role">${escapeHtml(safeText(p.jobTitle, ""))}</div>
    </div>
  `;
}

function buildContactBlock(mode) {
  const p = state.personal;

  const items = [
    safeText(p.phone, ""),
    safeText(p.email, ""),
    safeText(p.location, ""),
    safeText(p.link, ""),
  ].filter(Boolean);

  if (!items.length) return "";

  if (mode === "left") {
    return `
      <div class="sec" style="padding:0;">
        <div class="section-title">Contact</div>
        <div class="contact">
          ${items.map(i => `<div>${escapeHtml(i)}</div>`).join("")}
        </div>
      </div>
    `;
  }

  // row
  return `
    <div class="contact" style="display:flex; gap:14px; flex-wrap:wrap; margin-top:10px;">
      ${items.map(i => `<div>${escapeHtml(i)}</div>`).join("")}
    </div>
  `;
}

function buildPhotoBlock(shape) {
  const wantPhoto = state.meta.photoMode === "on";
  const hasPhoto = !!state.photoDataUrl;

  // If photo is off, show nothing
  if (!wantPhoto) return "";

  // If template is ATS, we keep photo optional but allowed
  // If no photo, show nothing (cleaner)
  if (!hasPhoto) return "";

  if (shape === "circle") {
    return `
      <div class="photo">
        <img src="${state.photoDataUrl}" alt="Photo" />
      </div>
    `;
  }

  return `
    <div class="photo">
      <img src="${state.photoDataUrl}" alt="Photo" />
    </div>
  `;
}

function buildSummarySection() {
  const s = safeText(state.summary, "");
  if (!s) return "";
  return `
    <div class="sec" data-sec="summary">
      <div class="section-title">Summary</div>
      <p class="para">${escapeHtml(s)}</p>
    </div>
  `;
}

function buildSkillsSection() {
  if (!state.skills.length) return "";
  return `
    <div class="sec" data-sec="skills">
      <div class="section-title">Skills</div>
      <div class="chips">
        ${state.skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join("")}
      </div>
    </div>
  `;
}

function buildExperienceSection() {
  if (!state.experience.length) return "";
  const html = state.experience.map(job => {
    const line = [
      safeText(job.role, ""),
      safeText(job.company, ""),
      safeText(job.location, ""),
      fmtRange(job.start, job.end),
    ].filter(Boolean).join(" | ");

    const bullets = (job.bullets || []).map(b => b.trim()).filter(Boolean);

    return `
      <div class="item">
        <div class="line1">${escapeHtml(line)}</div>
        ${bullets.length ? `<ul>${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
      </div>
    `;
  }).join("");

  return `
    <div class="sec" data-sec="experience">
      <div class="section-title">Work Experience</div>
      ${html}
    </div>
  `;
}

function buildEducationSection() {
  if (!state.education.length) return "";
  const html = state.education.map(edu => {
    const line = [
      safeText(edu.course, ""),
      safeText(edu.school, ""),
      safeText(edu.location, ""),
      fmtRange(edu.start, edu.end),
    ].filter(Boolean).join(" | ");

    const bullets = (edu.bullets || []).map(b => b.trim()).filter(Boolean);

    return `
      <div class="item">
        <div class="line1">${escapeHtml(line)}</div>
        ${bullets.length ? `<ul>${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
      </div>
    `;
  }).join("");

  return `
    <div class="sec" data-sec="education">
      <div class="section-title">Education</div>
      ${html}
    </div>
  `;
}

function buildProjectsSection() {
  if (!state.projects.length) return "";
  const html = state.projects.map(p => {
    const line = [
      safeText(p.name, ""),
      safeText(p.year, ""),
    ].filter(Boolean).join(" | ");

    const link = safeText(p.link, "");
    const bullets = (p.bullets || []).map(b => b.trim()).filter(Boolean);

    return `
      <div class="item">
        <div class="line1">${escapeHtml(line)}${link ? ` • ${escapeHtml(link)}` : ""}</div>
        ${bullets.length ? `<ul>${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
      </div>
    `;
  }).join("");

  return `
    <div class="sec" data-sec="projects">
      <div class="section-title">Projects</div>
      ${html}
    </div>
  `;
}

function buildCertsSection() {
  if (!state.certs.length) return "";
  const html = state.certs.map(c => {
    const line = [
      safeText(c.name, ""),
      safeText(c.issuer, ""),
      safeText(c.year, ""),
    ].filter(Boolean).join(" | ");
    return `<div class="item"><div class="line1">${escapeHtml(line)}</div></div>`;
  }).join("");

  return `
    <div class="sec" data-sec="certs">
      <div class="section-title">Certifications</div>
      ${html}
    </div>
  `;
}

function buildRefereesSection() {
  const t = safeText(state.referees, "").trim();
  if (!t) return "";
  const lines = t.split("\n").map(x => x.trim()).filter(Boolean);

  return `
    <div class="sec" data-sec="referees">
      <div class="section-title">Referees</div>
      ${lines.map(l => `<div class="item"><div class="line1">${escapeHtml(l)}</div></div>`).join("")}
    </div>
  `;
}

// ---------- Escape helpers ----------
function escapeHtml(str) {
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}

// ---------- Bind inputs ----------
function bindPersonalInputs() {
  const p = state.personal;

  els.fullName.value = p.fullName;
  els.jobTitle.value = p.jobTitle;
  els.phone.value = p.phone;
  els.email.value = p.email;
  els.location.value = p.location;
  els.link.value = p.link;

  const map = [
    ["fullName", "fullName"],
    ["jobTitle", "jobTitle"],
    ["phone", "phone"],
    ["email", "email"],
    ["location", "location"],
    ["link", "link"],
  ];

  map.forEach(([id, key]) => {
    els[id].addEventListener("input", () => {
      state.personal[key] = els[id].value;
      saveState();
      renderPreview();
    });
  });

  els.summary.value = state.summary;
  els.summary.addEventListener("input", () => {
    state.summary = els.summary.value;
    saveState();
    renderPreview();
  });

  els.referees.value = state.referees;
  els.referees.addEventListener("input", () => {
    state.referees = els.referees.value;
    saveState();
    renderPreview();
  });
}

function bindControls() {
  els.templateSelect.value = state.meta.template;
  els.accentColor.value = state.meta.accent;
  els.fontSelect.value = state.meta.font;
  els.photoToggle.value = state.meta.photoMode;

  els.templateSelect.addEventListener("change", () => {
    state.meta.template = els.templateSelect.value;
    saveState();
    renderPreview();
  });

  els.accentColor.addEventListener("input", () => {
    state.meta.accent = els.accentColor.value;
    saveState();
    renderPreview();
  });

  els.fontSelect.addEventListener("change", () => {
    state.meta.font = els.fontSelect.value;
    saveState();
    renderPreview();
  });

  els.photoToggle.addEventListener("change", () => {
    state.meta.photoMode = els.photoToggle.value;
    saveState();
    renderPreview();
  });
}

function bindSkills() {
  const addSkill = () => {
    const s = safeText(els.skillInput.value, "");
    if (!s) return;

    // avoid duplicates
    const exists = state.skills.some(x => x.toLowerCase() === s.toLowerCase());
    if (exists) {
      els.skillInput.value = "";
      return;
    }

    state.skills.push(s);
    els.skillInput.value = "";
    saveState();
    renderAll();
  };

  els.btnAddSkill.addEventListener("click", addSkill);
  els.skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  });
}

function bindAddButtons() {
  $("btnAddExp").addEventListener("click", () => {
    state.experience.unshift({
      id: crypto.randomUUID(),
      role: "New Role",
      company: "",
      location: "",
      start: "",
      end: "",
      bullets: ["Did something important..."],
    });
    saveState();
    renderAll();
  });

  $("btnAddEdu").addEventListener("click", () => {
    state.education.unshift({
      id: crypto.randomUUID(),
      course: "New Qualification",
      school: "",
      location: "",
      start: "",
      end: "",
      bullets: [],
    });
    saveState();
    renderAll();
  });

  $("btnAddProj").addEventListener("click", () => {
    state.projects.unshift({
      id: crypto.randomUUID(),
      name: "New Project",
      link: "",
      year: "",
      bullets: ["What you built..."],
    });
    saveState();
    renderAll();
  });

  $("btnAddCert").addEventListener("click", () => {
    state.certs.unshift({
      id: crypto.randomUUID(),
      name: "New Certification",
      issuer: "",
      year: "",
    });
    saveState();
    renderAll();
  });
}

function bindPhoto() {
  function refreshPhotoUI() {
    const has = !!state.photoDataUrl;
    if (has) {
      els.photoPreview.src = state.photoDataUrl;
      els.photoPreview.style.display = "block";
      els.photoFallback.style.display = "none";
    } else {
      els.photoPreview.src = "";
      els.photoPreview.style.display = "none";
      els.photoFallback.style.display = "grid";
    }
  }

  refreshPhotoUI();

  els.photoInput.addEventListener("change", async () => {
    const file = els.photoInput.files?.[0];
    if (!file) return;

    // basic size control
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Photo too large. Please use a photo under 2.5MB.");
      els.photoInput.value = "";
      return;
    }

    const dataUrl = await fileToDataURL(file);
    state.photoDataUrl = dataUrl;
    saveState();
    refreshPhotoUI();
    renderPreview();
  });

  els.btnRemovePhoto.addEventListener("click", () => {
    state.photoDataUrl = "";
    els.photoInput.value = "";
    saveState();
    refreshPhotoUI();
    renderPreview();
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Export / Import / Reset ----------
function bindExportImportReset() {
  els.btnExport.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cv_data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });

  els.importFile.addEventListener("change", async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const obj = JSON.parse(text);

      // minimal validation
      if (!obj.personal || !obj.meta) throw new Error("Invalid file");

      state = obj;
      saveState();
      renderAll();
    } catch (e) {
      alert("Invalid JSON file.");
    } finally {
      els.importFile.value = "";
    }
  });

  els.btnReset.addEventListener("click", () => {
    const ok = confirm("Reset everything? This will delete your saved CV.");
    if (!ok) return;
    state = defaultState();
    saveState();
    renderAll();
  });
}

// ---------- PDF Download ----------
function bindPDF() {
  els.btnDownload.addEventListener("click", async () => {
    // Ensure preview is rendered
    renderPreview();

    const filename = `${safeText(state.personal.fullName, "CV").replace(/\s+/g, "_")}_CV.pdf`;

    const opt = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Small UX: disable button while generating
    const old = els.btnDownload.textContent;
    els.btnDownload.textContent = "Generating PDF...";
    els.btnDownload.disabled = true;

    try {
      await html2pdf().set(opt).from(els.cv).save();
    } catch {
      alert("PDF failed. Try again in Chrome.");
    } finally {
      els.btnDownload.textContent = old;
      els.btnDownload.disabled = false;
    }
  });
}

// ---------- Main render ----------
function renderAll() {
  // Controls
  els.templateSelect.value = state.meta.template;
  els.accentColor.value = state.meta.accent;
  els.fontSelect.value = state.meta.font;
  els.photoToggle.value = state.meta.photoMode;

  // Builder lists
  renderSkillsBuilder();
  renderSectionOrder();
  renderExperienceCards();
  renderEducationCards();
  renderProjectCards();
  renderCertCards();

  // Preview
  renderPreview();
}

// ---------- Init ----------
function init() {
  bindControls();
  bindPersonalInputs();
  bindSkills();
  bindAddButtons();
  bindPhoto();
  bindExportImportReset();
  bindPDF();

  // initial render
  setAccent(state.meta.accent);
  setFont(state.meta.font);
  setTemplate(state.meta.template);

  renderAll();
}

init();
