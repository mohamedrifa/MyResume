// src/utils/pdfTemplate.js
export const resumeTemplate = (data, color, showPortfolioQR = false) => {

  const isGit = () => {
    if (data.git && data.git.trim() !== "") {
      return `• <br />
        <a href="${data.git}">${(data.git.includes("git") && "GitHub: ") + data.git}</a>`;
    } else {
      return "";
    }
  };

  const isPortfolio = () => {
    if (data.portfolio && data.portfolio.trim() !== "") {
      return `•
        <a href="${data.portfolio}">${"Portfolio: " + data.portfolio}</a>`;
    } else {
      return "";
    }
  };
  
  const portfolioQR = () => {
    if (showPortfolioQR && data.portfolio && data.portfolio.trim() !== "") {
      const encodedUrl = encodeURIComponent(data.portfolio);
      return `
        <div class="qr-code" role="complementary" aria-label="Portfolio QR Code">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodedUrl}" 
            alt="Scan to visit portfolio"
            style="height:100%; aspect-ratio:1 / 1;"
          />
          <div class="qr-label">Portfolio</div>
        </div>
      `;
    }
    return "";
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
      : (data.skills || "")
        .split(/<\/?div>|<\/?p>|<br\s*\/?>/i)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<div>${s}</div>`);

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

  const eachProjects = (projects) => {
    let projectContent = "";
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i] || {};
      const lines = String(p.description || "")
        .split(/<\/?div>|<\/?p>|<br\s*\/?>/i)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<div>${s}</div>`);
      const listItems = lines.map(line => `<li>${line}</li>`).join("");
      projectContent += `
        <div class="block">
          <div class="row-top" style="align-items:center;">
            <div class="row-top">
              <h3 style="margin:0;">${p.title || ""}</h3>
              ${
                p.link
                  ? `<a href="${p.link}" target="_blank" rel="noopener" style="
                      display:inline-block;
                      padding:1px 3px;
                      font-size:10px;
                      background:${color}50;
                      color:#fff;
                      border-radius:5px;
                      text-decoration:none;
                      margin-left:8px;
                      vertical-align:middle;
                    ">View</a>`
                  : ""
              }
            </div>
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
        .split(/<\/?div>|<\/?p>|<br\s*\/?>/i)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<div>${s}</div>`);
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

  const CustomSection = () => {
    if (!Array.isArray(data.customSections) || data.customSections.length === 0) {
      return "";
    }
    return data.customSections
      .map((section) => {
        const items = Array.isArray(section.items) ? section.items : [];
        return `
          <section aria-label="${section.title || "Custom Section"}">
            <h2>${section.title || "Custom Section"}</h2>
            ${items
              .map((item) => {
                if(!item.description.includes("</div><div>")) {
                  return `
                    <div class="block">
                      ${item.heading ? `<h3>${item.heading}</h3>` : ""}
                      ${item.description ? `<p>${item.description}</p>` : ""}
                    </div>
                  `;
                }
                const lines = String(item.description || "")
                  .split(/<\/?div>|<\/?p>|<br\s*\/?>/i)
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map(s => `<li><div>${s}</div></li>`)
                  .join("");
                return `
                  <div class="block">
                    ${item.heading ? `<h3>${item.heading}</h3>` : ""}
                    ${lines || lines !== "" ? `<ul>${lines}</ul>` : ""}
                  </div>
                `;
              })
              .join("")}
          </section>
        `;
      })
      .join("");
  };

  const certifications = () => {
    if (Array.isArray(data.certifications) && data.certifications.length > 0) {
      const items = data.certifications
        .map((c) => {
          if (!c?.name) return "";
          return `
            <li>
              <span>${c.name}</span>
              ${
                c.link
                  ? `<a href="${c.link}" target="_blank" rel="noopener" style="
                      display:inline-block;
                        padding:1px 3px;
                        font-size:10px;
                        background:${color}50;
                        color:#fff;
                        border-radius:5px;
                        text-decoration:none;
                        margin-left:8px;
                        vertical-align:middle;
                    ">View</a>`
                  : ""
              }
            </li>
          `;
        })
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
    <style>
      :root{
        --ink:#111;
        --muted:#444;
        --accent:${color};
        --meter-bg:#e5e7eb;
      }
      *{box-sizing:border-box;margin:0;padding:0;}
      html,body{
        background:#fff;
        color:var(--ink);
        font:14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,Helvetica,sans-serif;
      }

      /* --- key change: smaller outer margin for PDF --- */
      main{
        max-width:800px;
        margin:0 auto;
        padding:10px 10px; /* tighter padding for A4 fit */
      }

      h1{font-size:26px;letter-spacing:.3px;color:var(--accent);margin-bottom:4px;text-transform:uppercase}
      h2{font-size:16px;color:var(--accent);margin:14px 0 6px;letter-spacing:.2px}
      h3{font-size:14px;margin:0}
      p{margin:4px 0}
      ul{margin:4px 0 0 18px;padding:0}
      li{margin:2px 0}
      hr{border:0;border-top:2px solid var(--accent);margin:10px 0}

      .header{
        display:flex;
        flex-wrap:wrap;
        align-items:center;
        justify-content:center;
        text-align:${(data.profile && data.profile.trim() !== "") || (data.portfolio && data.portfolio.trim() !== "" && showPortfolioQR) ? "left" : "center"};
        gap:16px;
      }
      .photo{
        flex-shrink:0;
        width:95px;
        height:95px;
        border-radius:50%;
        overflow:hidden;
      }
      .photo img{
        width:100%;height:100%;object-fit:cover;display:block;
      }
      .qr-code{
        bottom:15px;
        right:15px;
        text-align:center;
        background:white;
        padding:8px;
        border:2px solid var(--accent);
        border-radius:4px;
        box-shadow:0 2px 8px rgba(0,0,0,0.1);
      }
      .qr-label{
        font-size:11px;
        color:var(--accent);
        font-weight:600;
        margin-top:4px;
        text-transform:uppercase;
        letter-spacing:0.5px;
      }
      .header-text{flex:1}
      .subtle{color:var(--muted)}
      .contact{margin-top:4px;font-size:13px;line-height:1.3}
      .contact a{color:var(--accent);text-decoration:none}
      .block{margin:6px 0 10px}
      .row-top{display:flex;gap:8px;flex-wrap:wrap;align-items:baseline;justify-content:space-between}
      .where-when{font-size:13px;color:var(--muted)}
      address{font-style:normal}

      /* Language bars (unchanged) */
      .lang-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}
      .lang-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
      .lang-name{font-weight:600}
      .lang-pct{font-size:12px;color:var(--muted)}
      .meter{width:100%;height:6px;background:var(--meter-bg);border-radius:6px;overflow:hidden;}
      .meter-bar{height:100%;background:var(--accent);width:0%;transition:width .2s ease;}

      /* Print layout: set true page margins for A4 */
      @page {
        size: A4;
        margin: 10mm 0mm; /* <--- smaller print margin */
      }
      @media print{
        main{margin:0;padding:0;}
        a{color:inherit;text-decoration:none}
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
        ${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : ""} ${data.phone ? `• <a href="tel:{data.phone}">${data.phone}</a>` : ""}<br />
        ${data.linkedIn ? `<a href="${data.linkedIn}">${(data.linkedIn.includes("linkedin") && "LinkedIn: ") + data.linkedIn}</a>` : ""} ${isGit()} ${isPortfolio()}
      </address>
    </div>
    ${portfolioQR()}
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

  <!-- Custom Sections -->
  ${CustomSection()}

  <!-- Certifications -->
  ${certifications()}

</main>
</body>
</html>
  `;
};
