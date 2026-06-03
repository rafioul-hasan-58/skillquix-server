// ─── Types ────────────────────────────────────────────────────────────────────

export interface ITemp8Education {
  degree?: string;
  certificateName?: string;
  institution?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
}

export interface ITemp8Experience {
  company?: string;
  position?: string;
  duration?: string;
  responsibilities?: string;
  projects?: string[];
}

export interface ITemp8Skill {
  skillName?: string;
  proficiencyLevel?: string;
}

export interface ITemp8Language {
  language?: string;
  level?: string;
}

export interface ITemp8User {
  profileImage?: string;
}

export interface ITemp8ResumeData {
  fullName?: string;
  currentRole?: string;
  resumeSummary?: string;
  email?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: ITemp8Skill[];
  languages?: ITemp8Language[] | string[];
  hobbies?: string[];
  educationsAndCertifications?: ITemp8Education[];
  workExperiences?: ITemp8Experience[];
  user?: ITemp8User;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_BG  = "#5c6370";
const NAMEBOX_BG = "#f0ede8";
const DARK       = "#1a1a1a";
const BODY       = "#2d2d2d";
const MUTED      = "#4a4a4a";
const DIVIDER    = "#9ca3af";
const F          = "'Courier New', Courier, 'Lucida Console', monospace";

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

  // ── Destructure ───────────────────────────────────────────────────────────
  const {
    fullName        = "",
    currentRole     = "",
    resumeSummary   = "",
    email           = "",
    location        = "",
    phoneNumber     = "",
    linkedinUrl     = "",
    portfolioUrl    = "",
    skills          = [],
    languages       = [],
    hobbies         = [],
    educationsAndCertifications = [],
    workExperiences = [],
    user,
  } = data;

  const profileImage = user?.profileImage ?? "";

  // ── Normalise languages — DB sends { language, level }[] but some older
  //    payloads may send string[]. Handle both defensively.
  const normalisedLanguages: ITemp8Language[] = (languages as Array<ITemp8Language | string>).map(
    (l) => typeof l === "string" ? { language: l, level: "" } : l
  );

  // ── CONTACT ───────────────────────────────────────────────────────────────
  const contactHtml = (phoneNumber || email || location || portfolioUrl || linkedinUrl) ? `
    <div style="margin-bottom:24px;">
      ${sectionHeading("CONTACT")}
      ${phoneNumber ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <span style="font-family:${F};font-size:11px;color:${DARK};font-weight:700;min-width:52px;">Phone:</span>
        <span style="font-family:${F};font-size:11px;color:${BODY};">${phoneNumber}</span>
      </div>` : ""}
      ${email ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <span style="font-family:${F};font-size:11px;color:${DARK};font-weight:700;min-width:52px;">Email:</span>
        <span style="font-family:${F};font-size:11px;color:${BODY};">${email}</span>
      </div>` : ""}
      ${location ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <span style="font-family:${F};font-size:11px;color:${DARK};font-weight:700;min-width:52px;">Address:</span>
        <span style="font-family:${F};font-size:11px;color:${BODY};">${location}</span>
      </div>` : ""}
      ${portfolioUrl ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <span style="font-family:${F};font-size:11px;color:${DARK};font-weight:700;min-width:52px;">Web:</span>
        <span style="font-family:${F};font-size:11px;color:${BODY};">${portfolioUrl}</span>
      </div>` : ""}
      ${linkedinUrl ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <span style="font-family:${F};font-size:11px;color:${DARK};font-weight:700;min-width:52px;">LinkedIn:</span>
        <span style="font-family:${F};font-size:11px;color:${BODY};">${linkedinUrl}</span>
      </div>` : ""}
    </div>
  ` : "";

  // ── SKILLS ────────────────────────────────────────────────────────────────
  const skillsHtml = skills.length > 0 ? `
    <div style="margin-bottom:24px;">
      ${sectionHeading("SKILLS")}
      <ul style="list-style:none;padding:0;margin:0;">
        ${skills.map((s) => `
        <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;font-family:${F};font-size:11px;color:${BODY};">
          <span>•</span>
          <span>${s.skillName ?? ""}${s.proficiencyLevel ? ` <span style="color:${MUTED};">– ${s.proficiencyLevel}</span>` : ""}</span>
        </li>`).join("")}
      </ul>
    </div>
  ` : "";

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  const educationHtml = educationsAndCertifications.length > 0 ? `
    <div style="margin-bottom:24px;">
      ${sectionHeading("EDUCATION")}
      ${educationsAndCertifications.map((edu) => `
      <div style="margin-bottom:12px;">
        ${edu.degree ? `<p style="font-family:${F};font-size:11px;font-weight:700;color:${DARK};margin:0 0 2px 0;line-height:1.4;">${edu.degree}</p>` : ""}
        ${edu.institution ? `<p style="font-family:${F};font-size:10.5px;color:${MUTED};margin:0 0 1px 0;">${edu.institution}</p>` : ""}
        ${edu.passingYear ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0 0 1px 0;">${edu.passingYear}</p>` : ""}
        ${edu.certificateName ? `<p style="font-family:${F};font-size:10.5px;color:${BODY};font-style:italic;margin:0 0 1px 0;">${edu.certificateName}</p>` : ""}
        ${edu.organizationName ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0 0 1px 0;">${edu.organizationName}</p>` : ""}
        ${edu.issueDate ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0;">${edu.issueDate}</p>` : ""}
      </div>`).join("")}
    </div>
  ` : "";

  // ── LANGUAGES ─────────────────────────────────────────────────────────────
  const languagesHtml = normalisedLanguages.length > 0 ? `
    <div style="margin-bottom:24px;">
      ${sectionHeading("LANGUAGES")}
      <ul style="list-style:none;padding:0;margin:0;">
        ${normalisedLanguages.map((l) => `
        <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;font-family:${F};font-size:11px;color:${BODY};">
          <span>•</span>
          <span>
            ${l.language ? `<span style="font-weight:600;">${l.language}</span>` : ""}
            ${l.level ? `<span style="font-weight:400;"> – ${l.level}</span>` : ""}
          </span>
        </li>`).join("")}
      </ul>
    </div>
  ` : "";

  // ── HOBBIES ───────────────────────────────────────────────────────────────
  const hobbiesHtml = hobbies.length > 0 ? `
    <div style="margin-bottom:24px;">
      ${sectionHeading("HOBBIES")}
      <p style="font-family:${F};font-size:11px;color:${BODY};line-height:1.7;margin:0;">${hobbies.join(", ")}</p>
    </div>
  ` : "";

  // ── EXPERIENCE ────────────────────────────────────────────────────────────
  const experienceHtml = workExperiences.length > 0 ? `
    <div>
      ${sectionHeading("EXPERIENCE")}
      ${workExperiences.map((exp) => {
        const bullets = exp.responsibilities
          ? exp.responsibilities
              .split(/\n|(?<=[.!?])\s+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const projectBullets = exp.projects ?? [];
        const allBullets = [...bullets, ...projectBullets];

        return `
      <div style="margin-bottom:20px;">
        ${exp.position ? `<p style="font-family:${F};font-size:13px;font-weight:700;color:${DARK};margin:0 0 2px 0;letter-spacing:0.02em;">${exp.position}</p>` : ""}
        ${(exp.company || exp.duration) ? `
        <p style="font-family:${F};font-size:11px;color:${MUTED};margin:0 0 8px 0;">
          ${exp.company ?? ""}${exp.company && exp.duration ? `<span style="margin:0 6px;">•</span>` : ""}${exp.duration ?? ""}
        </p>` : ""}
        ${allBullets.length > 0 ? `
        <ul style="list-style:none;padding:0;margin:0;">
          ${allBullets.map((b) => `
          <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
            <span style="font-family:${F};font-size:12px;color:${BODY};flex-shrink:0;line-height:1.6;">•</span>
            <span style="font-family:${F};font-size:11px;color:${BODY};line-height:1.6;">${b}</span>
          </li>`).join("")}
        </ul>` : ""}
      </div>`;
      }).join("")}
    </div>
  ` : "";

  // ── FULL HTML ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName || "CV"} — CV</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; }
    body {
      background: #ffffff;
      font-family: 'Courier New', Courier, 'Lucida Console', monospace;
    }
    .card { width: 100%; background: #ffffff; }
    .header-band {
      background: ${HEADER_BG};
      padding: 20px 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .name-box {
      background: ${NAMEBOX_BG};
      padding: 14px 48px 16px;
      text-align: center;
      border: 4px solid #ffffff33;
    }
    .name-box h1 {
      font-family: ${F};
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: ${DARK};
      margin: 0 0 4px 0;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .name-box .job-title {
      font-family: ${F};
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.28em;
      color: ${MUTED};
      margin: 0;
      text-transform: uppercase;
    }
    .body-wrap { padding: 24px 40px 40px; }
    .summary-section { margin-bottom: 24px; }
    .summary-section p {
      font-family: ${F};
      font-size: 11px;
      color: ${BODY};
      line-height: 1.75;
      text-align: justify;
      margin: 0;
    }
    .two-col {
      display: flex;
      gap: 40px;
      align-items: flex-start;
    }
    .left-col { flex: 0 0 34%; min-width: 0; }
    .right-col { flex: 1; min-width: 0; }
  </style>
</head>
<body>
  <div class="card">

    <!-- HEADER BAND -->
    <div class="header-band">
      <div class="name-box">
        ${fullName ? `<h1>${fullName}</h1>` : ""}
        ${currentRole ? `<p class="job-title">${currentRole}</p>` : ""}
      </div>
    </div>

    <!-- BODY -->
    <div class="body-wrap">

      <!-- SUMMARY -->
      ${resumeSummary ? `
      <div class="summary-section">
        ${sectionHeading("SUMMARY")}
        <p>${resumeSummary}</p>
      </div>` : ""}

      <!-- TWO COLUMNS -->
      <div class="two-col">

        <!-- LEFT -->
        <div class="left-col">
          ${contactHtml}
          ${skillsHtml}
          ${educationHtml}
          ${languagesHtml}
          ${hobbiesHtml}
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