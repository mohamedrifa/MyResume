// src/utils/pdfTemplate.js
export const resumeTemplate = (data, color) => {

  const isGit = () => {
    if (data.git && data.git.trim() !== "") {
      return `•
        <a href="${data.git}">${data.git}</a>`;
    } else {
      return "";
    }
  };

  const summary = () => {
    if (data.summary && data.summary.trim() !== "") {
      return `<section aria-label="Summary">
    <h2>Summary</h2>
    <p>
      ${data.summary}
    </p>
  </section>`;} 
    else {
      return "";
    }
  };

  const skillspara = (skillsArray) => {
    let skillsContent = "";
    for (let i = 0; i < skillsArray.length; i++) {
      const s = String(skillsArray[i]).trim();
      if (!s) continue;
      skillsContent += `<p>${s}</p>`;
    }
    return skillsContent;
  };

  const skillsSection = () => {
    const skillsArray = Array.isArray(data.skills)
      ? data.skills
      : (data.skills || "").split(';');

    const hasAny = skillsArray.some(s => String(s).trim().length > 0);
    if (hasAny) {
      return `<section aria-label="Skills">
        <h2>Skills</h2>
        ${skillspara(skillsArray)}
      </section>`;
    }
    return "";
  };

  const profileImage = () => {
    if (data.profile && data.profile.trim() !== "") {
      return `
      <div class="photo">
        <img src="${data.profile}" alt="Profile photo of ${data.name}" />
      </div>`;
    } else {
      return ``;
    }
  };

  const headerStyle = data.profile && data.profile.trim() !== "" ? "text-align:left;" : "text-align:center;";

  const eachProjects = (projects) => {
    let projectContent = "";
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i] || {};
      const lines = String(p.description || "")
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);
      const listItems = lines.map(line => `<li>${line}</li>`).join('');
      projectContent += `
        <div class="block">
          <div class="row-top">
            <h3>${p.title || ""}</h3>
            <div class="where-when">${p.stack || ""}</div>
          </div>
          ${listItems ? `<ul>${listItems}</ul>` : ""}
        </div>
      `;
    }
    return projectContent;
  };

  const projects = () => {
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      return `
    <section aria-label="Projects">
      <h2>Projects</h2>
      ${eachProjects(data.projects)}
    </section>
      `;
    }
    return "";
  };

  const eachExperience = (experiences) => {
    let experienceContent = "";
    for (let i = 0; i < experiences.length; i++) {
      const p = experiences[i] || {};
      const lines = String(p.summary || "")
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);
      const listItems = lines.map(line => `<li>${line}</li>`).join('');
      experienceContent += `
        <div class="block">
          <div class="row-top">
            <h3>${p.role || ""} — ${p.company || ""}</h3>
            <div class="where-when">
              <time datetime="${p.from || ""}">${p.from || ""}</time> – <time datetime="${p.to || ""}">${p.to || ""}</time> • ${p.location || ""}
            </div>
          </div>
          ${listItems ? `<ul>${listItems}</ul>` : ""}
        </div>
      `;
    }
    return experienceContent;
  };

  const experience = () => {
    if (Array.isArray(data.experience) && data.experience.length > 0) {
      return `
      <section aria-label="Experience">
        <h2>Experience</h2>
        ${eachExperience(data.experience)}
      </section>`;
    } else {
      return "";
    }
  };

  const eachEducation = (educations) => {
    let educationContent = "";
    const score = (a) => {
      const num = parseFloat(a);
      if (isNaN(num)) return "";
      return num <= 10 ? "CGPA:" : "Percentage:";
    };
    for (let i = 0; i < educations.length; i++) {
      const p = educations[i] || {};
      educationContent += `
      <div class="block">
        <h3>${p.stream || ""}</h3>
        <div class="where-when">${p.institute || ""} • <time datetime="${p.from || ""}">${p.from || ""}</time> – <time datetime="${p.to || ""}">${p.to || ""}</time></div>
        ${p.percentage ? `<div>${score(p.percentage)} ${p.percentage}</div>` : ""}
      </div>
      `;
    }
    return educationContent;
  };

  const education = () => {
    if (Array.isArray(data.education) && data.education.length > 0) {
      return `
      <section aria-label="Education">
        <h2>Education</h2>
        ${eachEducation(data.education)}
      </section>
      `;
    } else {
      return "";
    }
  };

  const certifications = () => {
    if (Array.isArray(data.certifications) && data.certifications.length > 0) {
      const items = data.certifications
        .map((c) => (c && c.name ? `<li>${c.name}</li>` : ""))
        .join("");
      if (!items.trim()) return "";
      return `
      <section aria-label="Certifications">
        <h2>Certifications</h2>
        <ul>
          ${items}
        </ul>
      </section>`;
    } else {
      return "";
    }
  };

  /* ---------- NEW: Languages (with progress bars) ---------- */
  const clampPct = (v) => {
    const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  const languagesSection = () => {
    const arr = Array.isArray(data.languages) ? data.languages : [];

    // Filter valid entries (need at least a language name)
    const rows = arr
      .map((x) => ({
        language: String(x?.language || "").trim(),
        proficiency: clampPct(x?.proficiency),
      }))
      .filter((x) => x.language.length > 0);

    if (rows.length === 0) return "";

    const items = rows
      .map(
        (l) => `
        <div class="lang-item" role="group" aria-label="${l.language}">
          <div class="lang-row">
            <span class="lang-name">${l.language}</span>
            <span class="lang-pct" aria-hidden="true">${l.proficiency}%</span>
          </div>
          <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${l.proficiency}" aria-label="${l.language} proficiency">
            <div class="meter-bar" style="width:${l.proficiency}%"></div>
          </div>
        </div>`
      )
      .join("");

    return `
      <section aria-label="Languages">
        <h2>Languages</h2>
        <div class="lang-list">
          ${items}
        </div>
      </section>
    `;
  };
  /* -------------------------------------------------------- */

  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.name} — Resume</title>
  <meta name="viewport" content="width=device-width, initial-scale=0.8, user-scalable=no">
  <!-- Minimal, ATS-friendly CSS -->
  <style>
    :root{
      --ink:#111;
      --muted:#444;
      --accent:${color};
      --meter-bg:#e5e7eb;
    }
    *{box-sizing:border-box}
    html,body{
      margin:0;padding:0;
      background:#fff;
      color:var(--ink);
      font:15px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,Helvetica,sans-serif;
    }
    main{
      max-width:820px;
      margin:28px auto;
      padding:0 18px;
    }
    h1{font-size:28px;letter-spacing:.3px;color:var(--accent);margin:0 0 6px 0;text-transform:uppercase}
    h2{font-size:17px;color:var(--accent);margin:18px 0 6px 0;letter-spacing:.2px}
    h3{font-size:15px;margin:0}
    p{margin:6px 0 0 0}
    ul{margin:6px 0 0 18px;padding:0}
    li{margin:3px 0}
    hr{border:0;border-top:2px solid var(--accent);margin:14px 0}
    .header{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      justify-content:center;
      ${headerStyle}
      gap:20px;
    }
    .photo{
      flex-shrink:0;
      width:110px;
      height:110px;
      border-radius:50%;
      overflow:hidden;
    }
    .photo img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .header-text{
      flex:1 1 260px;
    }
    .subtle{color:var(--muted)}
    .contact{margin-top:6px;font-size:14px;line-height:1.4}
    .contact a{color:var(--accent);text-decoration:none}
    .block{margin:10px 0 12px 0}
    .row-top{display:flex;gap:10px;flex-wrap:wrap;align-items:baseline;justify-content:space-between}
    .where-when{font-size:14px;color:var(--muted)}
    .pilllist{margin:6px 0 0 0;display:flex;flex-wrap:wrap;gap:6px}
    .pill{border:1px solid #ddd;border-radius:4px;padding:2px 6px;font-size:13px}
    address{font-style:normal}

    /* Languages */
    .lang-list{display:flex;flex-direction:column;gap:10px;margin-top:6px}
    .lang-item{}
    .lang-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
    .lang-name{font-weight:600}
    .lang-pct{font-size:13px;color:var(--muted)}
    .meter{
      width:100%;
      height:8px;
      background:var(--meter-bg);
      border-radius:6px;
      overflow:hidden;
    }
    .meter-bar{
      height:100%;
      background:var(--accent);
      width:0%;
      transition:width .2s ease;
    }

    /* Print adjustments */
    @media print{
      main{margin:0;padding:0}
      a{color:inherit;text-decoration:none}
      .pill{border-color:#bbb}
    }
  </style>
</head>
<body>
<main role="main" aria-label="Resume">

  <!-- Header with Photo -->
  <header class="header" aria-label="Header">
    ${profileImage()}
    <div class="header-text">
      <h1>${(data.name || "").toUpperCase()}</h1>
      <div class="subtle">${data.title || ""}</div>
      <address class="contact">
        ${data.address || ""}<br />
        ${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : ""} ${data.phone ? `• <a href="tel:+91${data.phone}">+91&nbsp;${data.phone}</a>` : ""}<br />
        ${data.linkedIn ? `<a href="${data.linkedIn}">${data.linkedIn}</a>` : ""} ${isGit()}
      </address>
    </div>
  </header>

  <hr />

  <!-- Summary -->
  ${summary()}

  <!-- Skills -->
  ${skillsSection()}

  <!-- Projects -->
  ${projects()}

  <!-- Experience -->
  ${experience()}

  <!-- Education -->
  ${education()}

  <!-- Languages -->
  ${languagesSection()}

  <!-- Certifications -->
  ${certifications()}

</main>
</body>
</html>
  `;
};
