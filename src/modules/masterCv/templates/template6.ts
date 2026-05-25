// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ITemp6Education {
  degree?: string;
  certificateName?: string;
  institution?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
}

export interface ITemp6Experience {
  company?: string;
  position?: string;
  duration?: string;
  responsibilities?: string;
  projects?: string[];
}

export interface ITemp6Skill {
  skillName?: string;
  proficiencyLevel?: string;
}

export interface ITemp6Language {
  language?: string;
  level?: string;
}

export interface ITemp6User {
  profileImage?: string;
}

export interface ITemp6ResumeData {
  fullName?: string;
  currentRole?: string;
  resumeSummary?: string;
  email?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: ITemp6Skill[];
  languages?: ITemp6Language[];
  hobbies?: string[];
  educationsAndCertifications?: ITemp6Education[];
  workExperiences?: ITemp6Experience[];
  user?: ITemp6User;
}

// ─── Palette ───────────────────────────────────────────────────────────────────

const DARK    = "#111827";
const BODY    = "#374151";
const MUTED   = "#6b7280";
const ICON_BG = "#1f2937";
const DIVIDER = "#c8c8c8";
const F       = "Georgia, 'Times New Roman', Times, serif";

// ─── SVG Icons (white stroke, 13×13) ──────────────────────────────────────────

const phoneIcon = `<svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;

const emailIcon = `<svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;

const webIcon = `<svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`;

const locationIcon = `<svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;

const linkedinIcon = `<svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" stroke-width="2"/></svg>`;

// ─── Helper: section title with underline ──────────────────────────────────────

function sectionTitle(title: string): string {
  return `
    <div style="margin-bottom:12px;">
      <h2 style="font-family:${F};font-size:15px;font-weight:700;color:${DARK};letter-spacing:0.04em;margin:0 0 6px 0;">${title}</h2>
      <div style="width:100%;height:1.5px;background:${DIVIDER};"></div>
    </div>
  `;
}

// ─── Helper: contact row ───────────────────────────────────────────────────────

function contactRow(iconSvg: string, text: string): string {
  return `
    <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
      <div style="width:28px;height:28px;background:${ICON_BG};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${iconSvg}
      </div>
      <span style="font-family:${F};font-size:11px;color:${BODY};line-height:1.4;padding-top:6px;">${text}</span>
    </div>
  `;
}

// ─── Generator ─────────────────────────────────────────────────────────────────

export const generateTemp6Html = (data: ITemp6ResumeData): string => {

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
    ? `<img src="${profileImage}" alt="${fullName || "Profile"}" style="width:175px;height:175px;object-fit:cover;object-position:top;display:block;" />`
    : `<div style="width:175px;height:175px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">
        <svg width="60" height="60" fill="rgba(100,116,139,0.4)" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>`;

  // ── Work Experience entries ───────────────────────────────────────────────
  const experienceHtml =
    workExperiences.length > 0
      ? workExperiences
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
              <div style="margin-bottom:24px;">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:2px;">
                  <span style="font-family:${F};font-size:13px;font-weight:400;color:${BODY};">${exp.position ?? ""}</span>
                  ${exp.duration ? `<span style="font-family:${F};font-size:11px;color:${MUTED};flex-shrink:0;">${exp.duration}</span>` : ""}
                </div>
                ${exp.company ? `<p style="font-family:${F};font-size:13px;font-weight:700;color:${DARK};margin:0 0 6px 0;">${exp.company}</p>` : ""}
                ${
                  allBullets.length > 0
                    ? `<ul style="margin:0;padding-left:16px;">
                        ${allBullets
                          .map(
                            (b) =>
                              `<li style="font-family:${F};font-size:11px;color:${BODY};line-height:1.7;margin-bottom:2px;">${b}</li>`
                          )
                          .join("")}
                      </ul>`
                    : ""
                }
              </div>`;
          })
          .join("")
      : "";

  // ── Education entries ─────────────────────────────────────────────────────
  const educationHtml =
    educationsAndCertifications.length > 0
      ? educationsAndCertifications
          .map(
            (edu) => `
            <div style="margin-bottom:16px;">
              ${edu.degree ? `<p style="font-family:${F};font-size:13px;font-weight:700;color:${DARK};margin:0 0 1px 0;">${edu.degree}</p>` : ""}
              ${edu.institution ? `<p style="font-family:${F};font-size:11px;color:${BODY};margin:0 0 1px 0;">${edu.institution}</p>` : ""}
              ${edu.passingYear ? `<p style="font-family:${F};font-size:11px;color:${MUTED};margin:0 0 1px 0;">${edu.passingYear}</p>` : ""}
              ${edu.certificateName ? `<p style="font-family:${F};font-size:11px;color:${BODY};margin:0 0 1px 0;font-style:italic;">${edu.certificateName}</p>` : ""}
              ${edu.organizationName ? `<p style="font-family:${F};font-size:11px;color:${MUTED};margin:0 0 1px 0;">${edu.organizationName}</p>` : ""}
              ${edu.issueDate ? `<p style="font-family:${F};font-size:11px;color:${MUTED};margin:0;">${edu.issueDate}</p>` : ""}
            </div>`
          )
          .join("")
      : "";

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsHtml =
    skills.length > 0
      ? `<ul style="margin:0;padding:0;list-style:none;">
          ${skills
            .map(
              (s) => `
            <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
              <span style="font-size:13px;color:${BODY};flex-shrink:0;">•</span>
              <span style="font-family:${F};font-size:11px;color:${BODY};line-height:1.4;">${s.skillName ?? ""}${s.proficiencyLevel ? ` <span style="color:${MUTED};">– ${s.proficiencyLevel}</span>` : ""}</span>
            </li>`
            )
            .join("")}
        </ul>`
      : "";

  // ── Languages ─────────────────────────────────────────────────────────────
  const languagesHtml =
    languages.length > 0
      ? `<ul style="margin:0;padding:0;list-style:none;">
          ${languages
            .map(
              (l) => `
            <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
              <span style="font-size:13px;color:${BODY};flex-shrink:0;">•</span>
              <span style="font-family:${F};font-size:11px;color:${BODY};line-height:1.4;">${l.language ?? ""}${l.level ? ` – ${l.level}` : ""}</span>
            </li>`
            )
            .join("")}
        </ul>`
      : "";

  // ── Hobbies ───────────────────────────────────────────────────────────────
  const hobbiesHtml =
    hobbies.length > 0
      ? `<p style="font-family:${F};font-size:11px;color:${BODY};line-height:1.7;margin:0;">${hobbies.join(", ")}</p>`
      : "";

  // ── Contact section ───────────────────────────────────────────────────────
  const contactHtml =
    phoneNumber || email || portfolioUrl || location || linkedinUrl
      ? `<div style="margin-bottom:24px;">
          ${sectionTitle("Contacts")}
          ${phoneNumber  ? contactRow(phoneIcon,    phoneNumber)  : ""}
          ${email        ? contactRow(emailIcon,    email)        : ""}
          ${portfolioUrl ? contactRow(webIcon,      portfolioUrl) : ""}
          ${location     ? contactRow(locationIcon, location)     : ""}
          ${linkedinUrl  ? contactRow(linkedinIcon, linkedinUrl)  : ""}
        </div>`
      : "";

  // ── Full document ─────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName || "CV"} – Resume</title>
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
    }

    /* ── Two-column body ── */
    .cv-body {
      display: flex;
      min-height: 100vh;
    }

    /* ── Left main column (62%) ── */
    .cv-left {
      flex: 0 0 62%;
      padding: 32px 24px 32px 32px;
    }

    /* ── Right sidebar column (38%) ── */
    .cv-right {
      flex: 0 0 38%;
      padding: 32px 24px 32px 0;
      margin-left: 24px;
    }

    /* ── Photo wrapper ── */
    .photo-wrap {
      width: 175px;
      height: 175px;
      overflow: hidden;
      border-radius: 2px;
      background: #e5e7eb;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="cv-card">
    <div class="cv-body">

      <!-- ══ LEFT MAIN COLUMN ══ -->
      <div class="cv-left">

        <!-- Photo -->
        <div class="photo-wrap">
          ${photoHtml}
        </div>

        <!-- Name -->
        ${fullName ? `
        <h1 style="font-family:${F};font-size:30px;font-weight:900;color:${DARK};letter-spacing:0.06em;text-transform:uppercase;line-height:1;margin-bottom:4px;">${fullName}</h1>` : ""}

        <!-- Job Title -->
        ${currentRole ? `
        <p style="font-family:${F};font-size:12px;color:${BODY};letter-spacing:0.16em;font-weight:400;margin-bottom:28px;">${currentRole}</p>` : ""}

        <!-- Work Experience -->
        ${workExperiences.length > 0 ? `
        <div style="margin-bottom:8px;">
          ${sectionTitle("Work Experience")}
          ${experienceHtml}
        </div>` : ""}

        <!-- Hobbies -->
        ${hobbies.length > 0 ? `
        <div style="margin-bottom:24px;">
          ${sectionTitle("Hobbies")}
          ${hobbiesHtml}
        </div>` : ""}

      </div>

      <!-- ══ RIGHT SIDEBAR COLUMN ══ -->
      <div class="cv-right">

        <!-- Contacts -->
        ${contactHtml}

        <!-- About Me -->
        ${resumeSummary ? `
        <div style="margin-bottom:24px;">
          ${sectionTitle("About Me")}
          <p style="font-family:${F};font-size:11px;color:${BODY};line-height:1.7;">${resumeSummary}</p>
        </div>` : ""}

        <!-- Education & Certifications -->
        ${educationsAndCertifications.length > 0 ? `
        <div style="margin-bottom:24px;">
          ${sectionTitle("Education & Certifications")}
          ${educationHtml}
        </div>` : ""}

        <!-- Skills -->
        ${skills.length > 0 ? `
        <div style="margin-bottom:24px;">
          ${sectionTitle("Skills")}
          ${skillsHtml}
        </div>` : ""}

        <!-- Languages -->
        ${languages.length > 0 ? `
        <div style="margin-bottom:24px;">
          ${sectionTitle("Languages")}
          ${languagesHtml}
        </div>` : ""}

      </div>

    </div>
  </div>
</body>
</html>`;
};