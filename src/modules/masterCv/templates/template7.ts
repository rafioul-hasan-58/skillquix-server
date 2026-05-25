// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ITemp7Education {
  degree?: string;
  certificateName?: string;
  institution?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
}

export interface ITemp7Experience {
  company?: string;
  position?: string;
  duration?: string;
  responsibilities?: string;
  projects?: string[];
}

export interface ITemp7Skill {
  skillName?: string;
  proficiencyLevel?: string;
}

export interface ITemp7Language {
  language?: string;
  level?: string;
}

export interface ITemp7User {
  profileImage?: string;
}

export interface ITemp7ResumeData {
  fullName?: string;
  currentRole?: string;
  resumeSummary?: string;
  email?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: ITemp7Skill[];
  languages?: ITemp7Language[];
  hobbies?: string[];
  educationsAndCertifications?: ITemp7Education[];
  workExperiences?: ITemp7Experience[];
  user?: ITemp7User;
}

// ─── Palette ───────────────────────────────────────────────────────────────────

const DARK  = "#111827";
const BODY  = "#374151";
const MUTED = "#9ca3af";
const F     = "'Cormorant Garamond', Georgia, 'Times New Roman', Times, serif";

// ─── SVG Icons (currentColor stroke, 13×13) ───────────────────────────────────

const phoneIcon    = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
const emailIcon    = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
const webIcon      = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.8"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`;
const locationIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
const linkedinIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" stroke-width="1.8"/></svg>`;

// ─── Helper: sidebar section title ────────────────────────────────────────────

function sidebarSectionTitle(title: string): string {
  return `
    <div style="margin-top:22px;margin-bottom:12px;">
      <h2 style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${DARK};text-align:center;margin:0 0 7px 0;">${title}</h2>
      <div style="height:1px;background:#d1d5db;width:100%;"></div>
    </div>
  `;
}

// ─── Helper: main-column section title ────────────────────────────────────────

function mainSectionTitle(title: string): string {
  return `
    <div style="margin-bottom:16px;">
      <h2 style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${DARK};margin:0 0 6px 0;">${title}</h2>
      <div style="height:1px;background:#d1d5db;width:100%;"></div>
    </div>
  `;
}

// ─── Helper: contact icon row ──────────────────────────────────────────────────

function contactRow(iconSvg: string, text: string): string {
  return `
    <div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:0;">
      <span style="color:${MUTED};margin-top:1px;flex-shrink:0;">${iconSvg}</span>
      <span style="font-family:${F};font-size:11px;color:${BODY};line-height:1.5;">${text}</span>
    </div>
  `;
}

// ─── Generator ─────────────────────────────────────────────────────────────────

export const generateTemp7Html = (data: ITemp7ResumeData): string => {

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

  // ── Photo ─────────────────────────────────────────────────────────────────
  const photoHtml = profileImage
    ? `<img src="${profileImage}" alt="${fullName || "Profile"}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#e5e7eb;">
        <svg width="60" height="60" fill="rgba(100,110,130,0.4)" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>`;

  // ── About ─────────────────────────────────────────────────────────────────
  const aboutHtml = resumeSummary
    ? `${sidebarSectionTitle("About")}
       <p style="font-family:${F};font-size:11px;line-height:1.75;color:${BODY};text-align:justify;margin:0;">${resumeSummary}</p>`
    : "";

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsHtml =
    skills.length > 0
      ? `${sidebarSectionTitle("Expertise")}
         <ul style="list-style:none;padding:0;margin:0;">
           ${skills
             .map(
               (s) => `
             <li style="font-family:${F};font-size:11px;color:${BODY};line-height:1.9;text-align:center;">${s.skillName ?? ""}${s.proficiencyLevel ? ` <span style="color:${MUTED};">– ${s.proficiencyLevel}</span>` : ""}</li>`
             )
             .join("")}
         </ul>`
      : "";

  // ── Languages ─────────────────────────────────────────────────────────────
  const languagesHtml =
    languages.length > 0
      ? `${sidebarSectionTitle("Languages")}
         <ul style="list-style:none;padding:0;margin:0;">
           ${languages
             .map(
               (l) => `
             <li style="font-family:${F};font-size:11px;color:${BODY};line-height:1.9;text-align:center;">${l.language ?? ""}${l.level ? ` – ${l.level}` : ""}</li>`
             )
             .join("")}
         </ul>`
      : "";

  // ── Hobbies ───────────────────────────────────────────────────────────────
  const hobbiesHtml =
    hobbies.length > 0
      ? `${sidebarSectionTitle("Hobbies")}
         <p style="font-family:${F};font-size:11px;color:${BODY};line-height:1.75;text-align:center;margin:0;">${hobbies.join(", ")}</p>`
      : "";

  // ── Contacts ──────────────────────────────────────────────────────────────
  const contactRows = [
    portfolioUrl ? contactRow(webIcon,      portfolioUrl) : "",
    email        ? contactRow(emailIcon,    email)        : "",
    phoneNumber  ? contactRow(phoneIcon,    phoneNumber)  : "",
    location     ? contactRow(locationIcon, location)     : "",
    linkedinUrl  ? contactRow(linkedinIcon, linkedinUrl)  : "",
  ].filter(Boolean);

  const contactHtml =
    contactRows.length > 0
      ? `${sidebarSectionTitle("Contacts")}
         <div style="display:flex;flex-direction:column;gap:10px;">
           ${contactRows.join("")}
         </div>`
      : "";

  // ── Education (sidebar) ───────────────────────────────────────────────────
  const educationHtml =
    educationsAndCertifications.length > 0
      ? `${sidebarSectionTitle("Education & Certifications")}
         ${educationsAndCertifications
           .map(
             (edu) => `
           <div style="margin-bottom:12px;">
             ${edu.degree ? `<p style="font-family:${F};font-size:11px;font-weight:700;color:${DARK};letter-spacing:0.05em;margin:0 0 1px 0;">${edu.degree}</p>` : ""}
             ${edu.institution ? `<p style="font-family:${F};font-size:11px;color:${BODY};margin:0 0 1px 0;">${edu.institution}</p>` : ""}
             ${edu.passingYear ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0 0 1px 0;">${edu.passingYear}</p>` : ""}
             ${edu.certificateName ? `<p style="font-family:${F};font-size:11px;color:${BODY};font-style:italic;margin:0 0 1px 0;">${edu.certificateName}</p>` : ""}
             ${edu.organizationName ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0 0 1px 0;">${edu.organizationName}</p>` : ""}
             ${edu.issueDate ? `<p style="font-family:${F};font-size:10px;color:${MUTED};margin:0;">${edu.issueDate}</p>` : ""}
           </div>`
           )
           .join("")}`
      : "";

  // ── Name block (one word per line, large) ─────────────────────────────────
  const nameHtml = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map(
          (word) =>
            `<div style="font-family:${F};font-size:60px;font-weight:700;color:${DARK};letter-spacing:0.16em;text-transform:uppercase;line-height:1.0;display:block;">${word}</div>`
        )
        .join("")
    : "";

  // ── Work Experience ───────────────────────────────────────────────────────
  const experienceHtml =
    workExperiences.length > 0
      ? `${mainSectionTitle("Work Experience")}
         <div style="display:flex;flex-direction:column;gap:22px;">
           ${workExperiences
             .map((exp) => {
               const bullets = exp.responsibilities
                 ? exp.responsibilities
                     .split(/\n|(?<=[.!?])\s+/)
                     .map((s) => s.trim())
                     .filter(Boolean)
                 : [];

               const projectBullets = exp.projects ?? [];
               const allBullets = [...bullets, ...projectBullets];

               return `
             <div>
               <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:2px;">
                 <span style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:${DARK};">${exp.position ?? ""}</span>
                 ${exp.duration ? `<span style="font-family:${F};font-size:10px;color:${MUTED};flex-shrink:0;">${exp.duration}</span>` : ""}
               </div>
               ${exp.company ? `<p style="font-family:${F};font-size:11px;color:${BODY};margin:0 0 6px 0;">${exp.company}</p>` : ""}
               ${
                 allBullets.length > 0
                   ? `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:2px;">
                       ${allBullets
                         .map(
                           (b) => `
                         <li style="display:flex;align-items:flex-start;gap:7px;">
                           <span style="font-family:${F};font-size:11px;color:${BODY};flex-shrink:0;">•</span>
                           <span style="font-family:${F};font-size:10.5px;color:${BODY};line-height:1.65;">${b}</span>
                         </li>`
                         )
                         .join("")}
                     </ul>`
                   : ""
               }
             </div>`;
             })
             .join("")}
         </div>`
      : "";

  // ── Full HTML document ────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName || "CV"} – Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ffffff;
      font-family: ${F};
      margin: 0;
      padding: 0;
    }

    /* ── Card ── */
    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: #ffffff;
      overflow: hidden;
      display: flex;
    }

    /* ── Left sidebar — 35% ── */
    .cv-left {
      width: 35%;
      flex-shrink: 0;
      background: #ffffff;
      display: flex;
      flex-direction: column;
    }

    /* Photo — full-width square */
    .photo-wrap {
      width: 100%;
      padding-bottom: 100%;
      position: relative;
      overflow: hidden;
      background: #e5e7eb;
      flex-shrink: 0;
    }
    .photo-wrap > * {
      position: absolute;
      inset: 0;
    }

    /* Sidebar content */
    .sidebar-content {
      padding: 0 22px 24px 22px;
      flex: 1;
    }

    /* ── Right main — flex:1 ── */
    .cv-right {
      flex: 1;
      background: #ffffff;
      padding: 36px 32px 24px 32px;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <!-- ══ LEFT SIDEBAR ══ -->
    <div class="cv-left">

      <!-- Photo — full-width square -->
      <div class="photo-wrap">
        ${photoHtml}
      </div>

      <!-- Sidebar content -->
      <div class="sidebar-content">
        ${aboutHtml}
        ${skillsHtml}
        ${languagesHtml}
        ${hobbiesHtml}
        ${contactHtml}
        ${educationHtml}
      </div>
    </div>

    <!-- ══ RIGHT MAIN ══ -->
    <div class="cv-right">

      <!-- Job title -->
      ${currentRole ? `<p style="font-family:${F};font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${MUTED};font-weight:400;margin-bottom:4px;">${currentRole}</p>` : ""}

      <!-- Name -->
      ${fullName ? `<div style="margin-bottom:28px;">${nameHtml}</div>` : ""}

      <!-- Work Experience -->
      ${experienceHtml}

    </div>

  </div>
</body>
</html>`;
};