const emptyEdu = () => ({ stream: "", from: "", to: "", percentage: "", institute: "" });
const emptyExp = () => ({ role: "", location: "", company: "", from: "", to: "", summary: "" });
const emptyProj = () => ({ title: "", stack: "", description: "", link: "" });
const emptyCert = () => ({ name: "", link: "" });
const emptyLang = () => ({ language: "", proficiency: "" });

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
};

export const normalizeEducation = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyEdu()]).reverse().map((e) => ({
    stream: e.stream || e.degree || "",
    from: e.from || e.start || "",
    to: e.to || e.end || "",
    percentage: e.percentage || e.cgpa || "",
    institute: e.institute || e.school || e.college || e.name || "",
  }));
};

export const normalizeExperience = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyExp()]).reverse().map((x) => ({
    role: x.role || "",
    location: x.location || x.mode || "",
    company: x.company || "",
    from: x.from || "",
    to: x.to || "",
    summary: x.summary || "",
  }));
};

export const normalizeProjects = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyProj()]).reverse().map((p) => ({
    title: p.title || p.name || "",
    stack: p.stack || "",
    description: p.description || "",
    link: p.link || "",
  }));
};

export const normalizeCertifications = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyCert()]).reverse().map((c) => ({
    name: c.name || c.title || c.certificate || c || "",
    link: c.link || "",
  }));
};

export const normalizeLanguages = (raw) => {
  const arr = ensureArray(raw);
  const toNum = (v) => {
    const n = Number(String(v || "").replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return "";
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  return (arr.length ? arr : [emptyLang()]).reverse().map((l) => ({
    language: l.language || l.name || "",
    proficiency: l.proficiency === "" || l.proficiency === undefined ? "" : toNum(l.proficiency),
  }));
};