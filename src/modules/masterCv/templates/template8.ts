// ─── Types ────────────────────────────────────────────────────────────────────

export interface ITemp8Education {
  degree?: string;
  institution?: string;
  period?: string;
}

export interface ITemp8Experience {
  title?: string;
  company?: string;
  period?: string;
  bullets?: string[];
}

export interface ITemp8Language {
  language?: string;
  level?: string;
}

export interface ITemp8ResumeData {
  name?: string;
  title?: string;
  summary?: string;
  email?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  education?: ITemp8Education[];
  languages?: ITemp8Language[];
  experience?: ITemp8Experience[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_BG = "#5c6370";
const NAMEBOX_BG = "#f0ede8";
const DARK = "#1a1a1a";
const BODY = "#2d2d2d";
const MUTED = "#4a4a4a";
const DIVIDER = "#9ca3af";
const F = "'Courier New', Courier, 'Lucida Console', monospace";

// ─── Helper: spaced heading ───────────────────────────────────────────────────

function sectionHeading(title: string): string {
  const spaced = title.split("").join(" ");
  return `
    <div style="margin-bottom:16px;">
      <p style="font-family:${F};font-size:13px;font-weight:700;letter-spacing:0.18em;color:${DARK};margin:0 0 6px 0;">${spaced}</p>
      <div style="height:1px;background:${DIVIDER};width:100%;"></div>
    </div>
  `;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const generateTemp8Html = (data: ITemp8ResumeData): string => {
  const name        = data.name        ?? "";
  const title       = data.title       ?? "";
  const summary     = data.summary     ?? "";
  const phone       = data.phone       ?? "";
  const email       = data.email       ?? "";
  const address     = data.address     ?? "";
  const skills      = data.skills      ?? [];
  const education   = data.education   ?? [];
  const languages   = data.languages   ?? [];
  const experience  = data.experience  ?? [];

  // ── CONTACT ──────────────────────────────────────────────────────────────
  const contactHtml = (phone || email || address) ? `
    <div style="margin-bottom:32px;">
      ${sectionHeading("CONTACT")}
      ${phone ? `
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <span style="font-family:${F};font-size:12px;color:${DARK};font-weight:700;min-width:52px;">Phone:</span>
        <span style="font-family:${F};font-size:12px;color:${BODY};">${phone}</span>
      </div>` : ""}
      ${email ? `
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <span style="font-family:${F};font-size:12px;color:${DARK};font-weight:700;min-width:52px;">Email:</span>
        <span style="font-family:${F};font-size:12px;color:${BODY};">${email}</span>
      </div>` : ""}
      ${address ? `
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <span style="font-family:${F};font-size:12px;color:${DARK};font-weight:700;min-width:52px;">Address:</span>
        <span style="font-family:${F};font-size:12px;color:${BODY};">${address}</span>
      </div>` : ""}
    </div>
  ` : "";

  // ── SKILLS ───────────────────────────────────────────────────────────────
  const skillsHtml = skills.length > 0 ? `
    <div style="margin-bottom:32px;">
      ${sectionHeading("SKILLS")}
      <ul style="list-style:none;padding:0;margin:0;">
        ${skills.map(s => `
        <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;font-family:${F};font-size:12px;color:${BODY};">
          <span style="margin-top:0;">•</span>
          <span>${s}</span>
        </li>`).join("")}
      </ul>
    </div>
  ` : "";

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  const educationHtml = education.length > 0 ? `
    <div style="margin-bottom:32px;">
      ${sectionHeading("EDUCATION")}
      ${education.map(edu => `
      <div style="margin-bottom:18px;">
        ${edu.degree ? `<p style="font-family:${F};font-size:12.5px;font-weight:700;color:${DARK};margin:0 0 3px 0;line-height:1.45;white-space:pre-line;">${edu.degree}</p>` : ""}
        ${(edu.institution || edu.period) ? `
        <p style="font-family:${F};font-size:11.5px;color:${MUTED};margin:0;">
          ${edu.institution ?? ""}${edu.institution && edu.period ? `<span style="margin:0 5px;">•</span>` : ""}${edu.period ?? ""}
        </p>` : ""}
      </div>`).join("")}
    </div>
  ` : "";

  // ── LANGUAGES ─────────────────────────────────────────────────────────────
  const languagesHtml = languages.length > 0 ? `
    <div>
      ${sectionHeading("LANGUAGES")}
      <ul style="list-style:none;padding:0;margin:0;">
        ${languages.map(l => `
        <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;font-family:${F};font-size:12px;color:${BODY};">
          <span>•</span>
          <span>
            ${l.language ? `<span style="font-weight:600;">${l.language}</span>` : ""}
            ${l.level ? `<span style="font-weight:400;"> - ${l.level}</span>` : ""}
          </span>
        </li>`).join("")}
      </ul>
    </div>
  ` : "";

  // ── EXPERIENCE ────────────────────────────────────────────────────────────
  const experienceHtml = experience.length > 0 ? `
    <div>
      ${sectionHeading("EXPERIENCE")}
      ${experience.map(exp => `
      <div style="margin-bottom:28px;">
        ${exp.title ? `<p style="font-family:${F};font-size:14px;font-weight:700;color:${DARK};margin:0 0 3px 0;letter-spacing:0.02em;">${exp.title}</p>` : ""}
        ${(exp.company || exp.period) ? `
        <p style="font-family:${F};font-size:12px;color:${MUTED};margin:0 0 10px 0;">
          ${exp.company ?? ""}${exp.company && exp.period ? `<span style="margin:0 6px;color:${MUTED};">•</span>` : ""}${exp.period ?? ""}
        </p>` : ""}
        ${(exp.bullets && exp.bullets.length > 0) ? `
        <ul style="list-style:none;padding:0;margin:0;">
          ${exp.bullets.map(b => `
          <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="font-family:${F};font-size:13px;color:${BODY};flex-shrink:0;line-height:1.6;">•</span>
            <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.7;">${b}</span>
          </li>`).join("")}
        </ul>` : ""}
      </div>`).join("")}
    </div>
  ` : "";

  // ── FULL HTML ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — CV</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
    }
    body {
      padding: 40px 20px;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      font-family: 'Courier New', Courier, 'Lucida Console', monospace;
    }
    .card {
      width: 860px;
      min-width: 860px;
      background: #ffffff;
      border-radius: 3px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      overflow: visible;
      position: relative;
      display: inline-block;
    }

    /* ── HEADER: uses padding-bottom to make room for the overlapping name box ── */
    .header-band {
      background: ${HEADER_BG};
      position: relative;
      padding-top: 18px;
      padding-bottom: 0;
      z-index: 1;
    }
    /* Name box sits at bottom of band, pulled down via negative margin */
    .name-box {
      position: relative;
      margin: 0 auto;
      background: ${NAMEBOX_BG};
      padding: 18px 52px 20px;
      text-align: center;
      width: fit-content;
      min-width: 420px;
      border: 4px solid ${HEADER_BG};
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      top: 32px;
      z-index: 2;
    }
    .name-box h1 {
      font-family: ${F};
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: ${DARK};
      margin: 0 0 6px 0;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .name-box .job-title {
      font-family: ${F};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.28em;
      color: ${MUTED};
      margin: 0;
      text-transform: uppercase;
    }

    /* Spacer compensates for the name-box top offset */
    .name-box-spacer {
      height: 52px;
    }

    .body-wrap { padding: 0 40px 48px; }
    .summary-section { margin-bottom: 36px; }
    .summary-section p {
      font-family: ${F};
      font-size: 12px;
      color: ${BODY};
      line-height: 1.85;
      text-align: justify;
      margin: 0;
    }
    .two-col {
      display: flex;
      gap: 44px;
      align-items: flex-start;
    }
    .left-col { flex: 0 0 36%; min-width: 0; }
    .right-col { flex: 1; min-width: 0; }
  </style>
</head>
<body>
  <div class="card">

    <!-- HEADER BAND with name box hanging below -->
    <div class="header-band">
      <div class="name-box">
        ${name ? `<h1>${name}</h1>` : ""}
        ${title ? `<p class="job-title">${title}</p>` : ""}
      </div>
    </div>

    <!-- Spacer: fills the space for the half of name-box below the band -->
    <div class="name-box-spacer"></div>

    <!-- BODY -->
    <div class="body-wrap">

      <!-- SUMMARY -->
      ${summary ? `
      <div class="summary-section">
        ${sectionHeading("SUMARY")}
        <p>${summary}</p>
      </div>` : ""}

      <!-- TWO COLUMNS -->
      <div class="two-col">

        <!-- LEFT -->
        <div class="left-col">
          ${contactHtml}
          ${skillsHtml}
          ${educationHtml}
          ${languagesHtml}
        </div>

        <!-- RIGHT -->
        <div class="right-col">
          ${experienceHtml}
        </div>

      </div>
    </div>

  </div>
</body>
</html>`;
};