// ─── Types matching DB exactly ─────────────────────────────────

type ITemp4Education = {
  degree?: string;
  certificateName?: string;
  institution?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
};

type ITemp4Skill = {
  skillName: string;
  proficiencyLevel?: string;
};

type ITemp4Experience = {
  company: string;
  position: string;       // was: role
  duration: string;       // was: period
  responsibilities?: string;
  projects?: string[];
};

type ITemp4ResumeData = {
  fullName: string;                               // was: name
  currentRole?: string;                           // was: title
  resumeSummary?: string;                         // was: profile
  location?: string;                              // was: address
  phoneNumber?: string;                           // was: phone
  email?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: ITemp4Skill[];                         // was: string[]
  languages?: { language: string; level: string }[];
  hobbies?: string[];
  educationsAndCertifications?: ITemp4Education[]; // was: education
  workExperiences?: ITemp4Experience[];            // was: experience
  user?: { profileImage?: string };
};

// ─── Generator ─────────────────────────────────────────────────

export const generateTemp4Html = (data: ITemp4ResumeData): string => {
  const {
    fullName = "",
    currentRole = "",
    resumeSummary = "",
    location = "",
    phoneNumber = "",
    email = "",
    linkedinUrl = "",
    portfolioUrl = "",
    skills = [],
    languages = [],
    hobbies = [],
    educationsAndCertifications = [],
    workExperiences = [],
    user,
  } = data;

  const profileImage = user?.profileImage ?? "";

  const F = "'Helvetica Neue', Arial, sans-serif";

  const sectionLabel = (text: string): string => `
    <p style="font-family:${F};font-size:11px;font-weight:800;letter-spacing:0.14em;color:#1a1a2e;text-transform:uppercase;margin:0 0 8px 0;">${text}</p>
  `;

  const cvBullet = (text: string, italic = false): string => `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
      <span style="font-size:15px;color:#374151;line-height:1.3;margin-top:0;flex-shrink:0;">•</span>
      <span style="font-family:${F};font-size:11px;color:#374151;line-height:1.55;font-style:${italic ? "italic" : "normal"};">${text}</span>
    </div>
  `;

  // ── Skills ──
  const skillsHtml =
    skills.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Skills")}
          ${skills
            .map((s: ITemp4Skill) =>
              cvBullet(
                s.proficiencyLevel
                  ? `${s.skillName} (${s.proficiencyLevel})`
                  : s.skillName
              )
            )
            .join("")}
        </div>`
      : "";

  // ── Languages ──
  const languagesHtml =
    languages.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Languages")}
          ${languages
            .map((l) => cvBullet(`${l.language} - ${l.level}`))
            .join("")}
        </div>`
      : "";

  // ── Hobbies ──
  const hobbiesHtml =
    hobbies.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Hobbies")}
          ${hobbies.map((h) => cvBullet(h)).join("")}
        </div>`
      : "";

  // ── Education ──
  const educationHtml =
    educationsAndCertifications.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Education")}
          ${educationsAndCertifications
            .map(
              (e: ITemp4Education, i: number) => `
            <div style="margin-bottom:${i < educationsAndCertifications.length - 1 ? "12px" : "0"};">
              ${e.degree ? `<p style="font-family:${F};font-size:11.5px;font-weight:600;color:#1f2937;margin:0 0 1px 0;">${e.degree}</p>` : ""}
              ${e.institution ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 1px 0;">${e.institution}</p>` : ""}
              ${e.passingYear ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 1px 0;">${e.passingYear}</p>` : ""}
              ${e.certificateName ? `<p style="font-family:${F};font-size:11px;font-style:italic;color:#374151;margin:0 0 1px 0;">${e.certificateName}</p>` : ""}
              ${e.organizationName ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 1px 0;">${e.organizationName}</p>` : ""}
              ${e.issueDate ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0;">Issued: ${e.issueDate}</p>` : ""}
            </div>
          `
            )
            .join("")}
        </div>`
      : "";

  // ── Experience ──
  const experienceHtml =
    workExperiences.length > 0
      ? `<div>
          ${sectionLabel("Experience")}
          ${workExperiences
            .map(
              (exp: ITemp4Experience, i: number) => {
                const responsibilityBullets = exp.responsibilities
                  ? exp.responsibilities
                      .split(/\n|(?<=[.!?])\s+/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                const allBullets = [
                  ...responsibilityBullets,
                  ...(exp.projects ?? []),
                ];
                return `
                <div style="margin-bottom:${i < workExperiences.length - 1 ? "14px" : "0"};">
                  ${exp.position ? `<p style="font-family:${F};font-size:11.5px;font-weight:700;font-style:italic;color:#1f2937;margin:0 0 1px 0;">${exp.position}</p>` : ""}
                  ${exp.company ? `<p style="font-family:${F};font-size:11.5px;font-weight:700;font-style:italic;color:#111827;margin:0 0 1px 0;">${exp.company}</p>` : ""}
                  ${exp.duration ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 5px 0;">${exp.duration}</p>` : ""}
                  ${allBullets.length > 0 ? `<div>${allBullets.map((b) => cvBullet(b)).join("")}</div>` : ""}
                </div>`;
              }
            )
            .join("")}
        </div>`
      : "";

  // ── Profile / Summary ──
  const profileHtml = resumeSummary
    ? `<div style="margin-bottom:18px;">
        ${sectionLabel("Profile")}
        <p style="font-family:${F};font-size:11px;color:#374151;line-height:1.65;text-align:justify;margin:0;">${resumeSummary}</p>
      </div>`
    : "";

  // ── Contact rows ──
  const contactRow = (svgPath: string, text: string) =>
    text
      ? `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
          <span style="margin-top:1px;flex-shrink:0;color:#374151;">
            <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${svgPath}
            </svg>
          </span>
          <span style="font-family:${F};font-size:11px;color:#374151;line-height:1.45;word-break:break-word;">${text}</span>
        </div>`
      : "";

  const locationPath = `<circle cx="12" cy="10" r="3" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>`;
  const phonePath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>`;
  const emailPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`;
  const linkPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>`;

  const contactHtml =
    location || phoneNumber || email || linkedinUrl || portfolioUrl
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Contact")}
          ${contactRow(locationPath, location)}
          ${contactRow(phonePath, phoneNumber)}
          ${contactRow(emailPath, email)}
          ${contactRow(linkPath, linkedinUrl)}
          ${contactRow(linkPath, portfolioUrl)}
        </div>`
      : "";

  // ── Photo ──
  const photoHtml = profileImage
    ? `<img src="${profileImage}" alt="${fullName}" style="width:160px;height:170px;object-fit:cover;object-position:top;display:block;" />`
    : `<div style="width:160px;height:170px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">
        <svg style="width:64px;height:64px;color:#9ca3af;" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName} – Resume</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ddd6fe;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: #ddd6fe;
      overflow: hidden;
      position: relative;
    }

    .cv-header {
      position: relative;
      background: #ede9fe;
      min-height: 200px;
    }
    .header-inner {
      display: flex;
      align-items: center;
      padding: 28px;
    }
    .photo-wrap {
      width: 160px;
      height: 170px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 0;
      margin-left: 50px;
      position: relative;
      z-index: 1;
    }
    .name-block {
      padding-left: 36px;
      flex: 1;
      position: relative;
      z-index: 1;
    }
    .cv-name {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 34px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 8px;
    }
    .cv-title {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      font-weight: 400;
      color: #374151;
      letter-spacing: 0.01em;
    }
    .header-divider {
      height: 1px;
      background: #382e90;
    }

    .deco-top-left {
      position: absolute; top: 0; left: 0;
      width: 60px; height: 60px;
      pointer-events: none; overflow: hidden; z-index: 2;
    }
    .deco-top-left-accent {
      position: absolute; bottom: 2px; right: 2px;
      width: 16px; height: 16px; background: #1e2d4a;
    }
    .deco-top-right {
      position: absolute; top: 0; right: 0;
      width: 70px; height: 90px;
      pointer-events: none; z-index: 2;
    }
    .deco-top-right-back {
      position: absolute; top: 0; right: 24px;
      width: 32px; height: 70px;
      background: #c4b5fd; opacity: 0.55;
    }
    .deco-top-right-front {
      position: absolute; top: 0; right: 0;
      width: 22px; height: 90px;
      background: #7c3aed; opacity: 0.75;
    }
    .deco-top-right-accent {
      position: absolute; top: 14px; right: 24px;
      width: 22px; height: 22px; background: #ddd6fe;
    }
    .deco-bottom-left {
      position: absolute; bottom: 0; left: 0;
      width: 80px; height: 48px;
      pointer-events: none; z-index: 2;
    }
    .deco-bottom-left-bar {
      position: absolute; bottom: 0; left: 0;
      width: 80px; height: 18px; background: #1e2d4a;
    }
    .deco-bottom-left-sq {
      position: absolute; bottom: 18px; left: 8px;
      width: 28px; height: 28px;
      background: #7c3aed; opacity: 0.8;
    }
    .deco-bottom-right {
      position: absolute; bottom: 0; right: 0;
      width: 80px; height: 60px;
      pointer-events: none; z-index: 2;
    }
    .deco-bottom-right-main {
      position: absolute; bottom: 0; right: 0;
      width: 44px; height: 44px;
      background: #7c3aed; opacity: 0.75;
    }
    .deco-bottom-right-sm {
      position: absolute; bottom: 44px; right: 44px;
      width: 20px; height: 20px;
      background: #c4b5fd; opacity: 0.7;
    }
    .deco-bottom-right-xs {
      position: absolute; bottom: 44px; right: 22px;
      width: 20px; height: 20px;
      background: #ddd6fe; opacity: 0.5;
    }

    .cv-body {
      position: relative;
      display: flex;
      background: #ede9fe;
    }
    .cv-left {
      width: 240px;
      min-width: 240px;
      padding: 22px 20px 24px 24px;
      border-right: 1px solid #382e90;
    }
    .cv-right {
      flex: 1;
      padding: 22px 24px 24px 22px;
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <!-- HEADER -->
    <div class="cv-header">
      <div class="deco-top-left">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon points="0,0 60,0 0,60" fill="#1e2d4a"/>
        </svg>
        <div class="deco-top-left-accent"></div>
      </div>
      <div class="deco-top-right">
        <div class="deco-top-right-back"></div>
        <div class="deco-top-right-front"></div>
        <div class="deco-top-right-accent"></div>
      </div>

      <div class="header-inner">
        <div class="photo-wrap">${photoHtml}</div>
        <div class="name-block">
          ${fullName ? `<h1 class="cv-name">${fullName}</h1>` : ""}
          ${currentRole ? `<p class="cv-title">${currentRole}</p>` : ""}
        </div>
      </div>

      <div class="header-divider"></div>
    </div>

    <!-- BODY -->
    <div class="cv-body">
      <div class="deco-bottom-left">
        <div class="deco-bottom-left-bar"></div>
        <div class="deco-bottom-left-sq"></div>
      </div>
      <div class="deco-bottom-right">
        <div class="deco-bottom-right-main"></div>
        <div class="deco-bottom-right-sm"></div>
        <div class="deco-bottom-right-xs"></div>
      </div>

      <!-- LEFT COLUMN -->
      <div class="cv-left">
        ${profileHtml}
        ${contactHtml}
        ${skillsHtml}
        ${languagesHtml}
        ${hobbiesHtml}
      </div>

      <!-- RIGHT COLUMN -->
      <div class="cv-right">
        ${educationHtml}
        ${experienceHtml}
      </div>
    </div>

  </div>
</body>
</html>`;
};