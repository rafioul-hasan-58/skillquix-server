// ─── Types matching DB exactly ─────────────────────────────────

type ITemp5Education = {
  degree?: string;
  certificateName?: string;
  institution?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
};

type ITemp5Skill = {
  skillName: string;
  proficiencyLevel?: string;
};

type ITemp5Experience = {
  company: string;
  position: string;       // was: title
  duration: string;       // was: period
  responsibilities?: string;
  projects?: string[];
};

type ITemp5ResumeData = {
  fullName: string;                                 // was: firstName + name split
  currentRole?: string;                             // was: title
  resumeSummary?: string;                           // was: summary
  phoneNumber?: string;                             // was: phone
  email?: string;
  location?: string;                                // was: address
  portfolioUrl?: string;                            // was: website
  linkedinUrl?: string;
  skills?: ITemp5Skill[];                           // was: string[]
  languages?: { language: string; level: string }[];
  hobbies?: string[];
  educationsAndCertifications?: ITemp5Education[];  // was: education
  workExperiences?: ITemp5Experience[];             // was: experience
  user?: { profileImage?: string };
};

// ─── Palette ───────────────────────────────────────────────────

const STEEL = "#4e6b7d";
const TAN   = "#c4956a";
const WHITE = "#ffffff";
const BODY  = "#2d3748";
const GRAY  = "#6b7280";
const DIVLN = "#e2e8f0";
const F = "'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif";

// ─── Helper: left-column section header ───────────────────────

function leftSectionHeader(label: string): string {
  return `
    <div style="position:relative;margin-bottom:16px;margin-left:-24px;">
      <div style="display:flex;align-items:center;">
        <div style="width:90px;height:34px;background:${STEEL};clip-path:polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%);flex-shrink:0;"></div>
        <span style="font-family:${F};font-size:13px;font-weight:700;letter-spacing:0.08em;color:${BODY};text-transform:uppercase;padding-left:12px;">${label}</span>
      </div>
      <div style="position:absolute;bottom:-8px;left:58px;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:9px solid ${TAN};"></div>
    </div>
  `;
}

// ─── Helper: right-column section header ──────────────────────

function rightSectionHeader(label: string): string {
  return `
    <div style="position:relative;margin-bottom:16px;margin-right:-24px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-family:${F};font-size:13px;font-weight:700;letter-spacing:0.08em;color:${BODY};text-transform:uppercase;flex-shrink:0;">${label}</span>
        <div style="flex:1;height:34px;background:${STEEL};clip-path:polygon(6% 0, 100% 0, 100% 100%, 6% 100%, 0 50%);"></div>
      </div>
      <div style="position:absolute;bottom:-8px;right:40px;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:9px solid ${TAN};"></div>
    </div>
  `;
}

// ─── Helper: timeline dot ─────────────────────────────────────

const dot = `<div style="width:11px;height:11px;border-radius:50%;background:${STEEL};flex-shrink:0;margin-top:2px;"></div>`;

// ─── Helper: contact row ──────────────────────────────────────

function contactRow(iconSvg: string, text: string): string {
  if (!text) return "";
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <div style="width:24px;height:24px;border-radius:50%;background:${STEEL};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${iconSvg}
      </div>
      <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.4;word-break:break-word;">${text}</span>
    </div>
  `;
}

// ─── SVG icons ────────────────────────────────────────────────

const phoneIcon    = `<svg style="width:11px;height:11px;" fill="none" stroke="${WHITE}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
const emailIcon    = `<svg style="width:11px;height:11px;" fill="none" stroke="${WHITE}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
const locationIcon = `<svg style="width:11px;height:11px;" fill="none" stroke="${WHITE}" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" stroke-width="2.2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;
const websiteIcon  = `<svg style="width:11px;height:11px;" fill="none" stroke="${WHITE}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2.2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`;

// ─── Generator ────────────────────────────────────────────────

export const generateTemp5Html = (data: ITemp5ResumeData): string => {
  const {
    fullName = "",
    currentRole = "",
    resumeSummary = "",
    phoneNumber = "",
    email = "",
    location = "",
    portfolioUrl = "",
    linkedinUrl = "",
    skills = [],
    languages = [],
    hobbies = [],
    educationsAndCertifications = [],
    workExperiences = [],
    user,
  } = data;

  const profileImage = user?.profileImage ?? "";

  // Split fullName into first + last for the styled header
  const nameParts = fullName.trim().split(" ");
  const lastName  = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts[0] : "";

  // ── Photo ──
  const photoHtml = profileImage
    ? `<img src="${profileImage}" alt="${fullName}" style="width:170px;height:100%;object-fit:cover;object-position:top;display:block;position:absolute;right:0;top:0;z-index:2;" />`
    : "";

  // ── Contact ──
  const contactHtml =
    phoneNumber || email || location || portfolioUrl || linkedinUrl
      ? `<div style="margin-bottom:24px;">
          ${leftSectionHeader("Contact")}
          <div style="padding-left:4px;padding-top:8px;">
            ${contactRow(phoneIcon,    phoneNumber)}
            ${contactRow(emailIcon,    email)}
            ${contactRow(locationIcon, location)}
            ${contactRow(websiteIcon,  portfolioUrl)}
            ${contactRow(websiteIcon,  linkedinUrl)}
          </div>
        </div>`
      : "";

  // ── Skills ──
  const skillsHtml =
    skills.length > 0
      ? `<div style="margin-bottom:24px;">
          ${leftSectionHeader("Skills")}
          <div style="padding-left:4px;padding-top:8px;">
            ${skills
              .map((s: ITemp5Skill) => {
                const label = s.proficiencyLevel
                  ? `${s.skillName} (${s.proficiencyLevel})`
                  : s.skillName;
                return `
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">
                  <span style="font-size:15px;color:${BODY};line-height:1.3;flex-shrink:0;">•</span>
                  <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.5;">${label}</span>
                </div>`;
              })
              .join("")}
          </div>
        </div>`
      : "";

  // ── Languages ──
  const languagesHtml =
    languages.length > 0
      ? `<div style="margin-bottom:24px;">
          ${leftSectionHeader("Languages")}
          <div style="padding-left:4px;padding-top:8px;">
            ${languages
              .map(
                (l) => `
              <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">
                <span style="font-size:15px;color:${BODY};line-height:1.3;flex-shrink:0;">•</span>
                <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.5;">${l.language} - ${l.level}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>`
      : "";

  // ── Hobbies ──
  const hobbiesHtml =
    hobbies.length > 0
      ? `<div style="margin-bottom:24px;">
          ${leftSectionHeader("Hobbies")}
          <div style="padding-left:4px;padding-top:8px;">
            ${hobbies
              .map(
                (h) => `
              <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">
                <span style="font-size:15px;color:${BODY};line-height:1.3;flex-shrink:0;">•</span>
                <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.5;">${h}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>`
      : "";

  // ── Education ──
  const educationHtml =
    educationsAndCertifications.length > 0
      ? `<div>
          ${leftSectionHeader("Education")}
          <div style="padding-left:4px;padding-top:8px;">
            ${educationsAndCertifications
              .map(
                (e: ITemp5Education, i: number) => `
              <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:${i < educationsAndCertifications.length - 1 ? "16px" : "0"};">
                ${dot}
                <div>
                  ${e.degree ? `<p style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.07em;color:${BODY};text-transform:uppercase;margin:0 0 2px 0;">${e.degree}</p>` : ""}
                  ${e.institution ? `<p style="font-family:${F};font-size:12px;color:${BODY};margin:0 0 1px 0;">${e.institution}</p>` : ""}
                  ${e.passingYear ? `<p style="font-family:${F};font-size:11px;color:${GRAY};margin:0 0 1px 0;">${e.passingYear}</p>` : ""}
                  ${e.certificateName ? `<p style="font-family:${F};font-size:11px;font-style:italic;color:${BODY};margin:0 0 1px 0;">${e.certificateName}</p>` : ""}
                  ${e.organizationName ? `<p style="font-family:${F};font-size:11px;color:${GRAY};margin:0 0 1px 0;">${e.organizationName}</p>` : ""}
                  ${e.issueDate ? `<p style="font-family:${F};font-size:11px;color:${GRAY};margin:0;">Issued: ${e.issueDate}</p>` : ""}
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>`
      : "";

  // ── Summary ──
  const summaryHtml = resumeSummary
    ? `<div style="margin-bottom:28px;">
        ${rightSectionHeader("Summary")}
        <div style="border-left:3px solid ${STEEL};padding-left:14px;margin-top:10px;">
          <p style="font-family:${F};font-size:12px;color:${BODY};line-height:1.75;margin:0;">${resumeSummary}</p>
        </div>
      </div>`
    : "";

  // ── Experience ──
  const experienceHtml =
    workExperiences.length > 0
      ? `<div>
          ${rightSectionHeader("Work Experience")}
          <div style="margin-top:10px;">
            ${workExperiences
              .map((exp: ITemp5Experience, i: number) => {
                const responsibilityBullets = exp.responsibilities
                  ? exp.responsibilities
                      .split(/\n|(?<=[.!?])\s+/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                const allBullets = [...responsibilityBullets, ...(exp.projects ?? [])];
                return `
                <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:${i < workExperiences.length - 1 ? "20px" : "0"};">
                  ${dot}
                  <div style="flex:1;">
                    ${exp.position ? `<p style="font-family:${F};font-size:12px;font-weight:700;letter-spacing:0.06em;color:${BODY};text-transform:uppercase;margin:0 0 3px 0;">${exp.position}</p>` : ""}
                    ${exp.company || exp.duration
                      ? `<p style="font-family:${F};font-size:12px;color:${BODY};margin:0 0 7px 0;">
                          ${exp.company ?? ""}
                          ${exp.company && exp.duration ? `<span style="margin:0 7px;color:#9ca3af;">|</span>` : ""}
                          ${exp.duration ? `<strong style="font-weight:700;">${exp.duration}</strong>` : ""}
                        </p>`
                      : ""}
                    ${allBullets.length > 0
                      ? `<div>${allBullets
                          .map(
                            (b) => `
                          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;">
                            <span style="font-size:15px;color:${BODY};line-height:1.3;flex-shrink:0;">•</span>
                            <span style="font-family:${F};font-size:12px;color:${BODY};line-height:1.55;">${b}</span>
                          </div>`
                          )
                          .join("")}</div>`
                      : ""}
                  </div>
                </div>`;
              })
              .join("")}
          </div>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName} – Resume</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${WHITE};
      font-family: ${F};
      margin: 0;
      padding: 0;
    }
    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: ${WHITE};
      overflow: hidden;
      position: relative;
    }
    .cv-header {
      position: relative;
      background: ${STEEL};
      height: 155px;
      overflow: visible;
    }
    .name-block {
      position: absolute;
      left: 75px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
    }
    .name-jobtitle {
      font-family: ${F};
      font-size: 10.5px;
      font-weight: 400;
      letter-spacing: 0.30em;
      color: rgba(255,255,255,0.85);
      text-transform: uppercase;
      margin: 0 0 3px 0;
    }
    .name-first {
      font-family: ${F};
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.22em;
      color: ${WHITE};
      text-transform: uppercase;
      margin: 0 0 2px 0;
    }
    .name-last {
      font-family: ${F};
      font-size: 50px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: ${WHITE};
      text-transform: uppercase;
      margin: 0;
      line-height: 1;
    }
    .photo-area {
      position: absolute;
      right: 0;
      top: 0;
      width: 220px;
      height: 100%;
      z-index: 1;
    }
    .photo-tan-bg {
      position: absolute;
      right: 0;
      top: 0;
      width: 220px;
      height: 100%;
      background: ${TAN};
      clip-path: polygon(35% 0, 100% 0, 100% 100%, 0% 100%);
    }
    .cv-body {
      display: flex;
      background: ${WHITE};
    }
    .cv-left {
      width: 310px;
      min-width: 310px;
      padding: 24px 20px 24px 24px;
      border-right: 1px solid ${DIVLN};
    }
    .cv-right {
      flex: 1;
      padding: 24px 24px 24px 24px;
      position: relative;
    }
    .bottom-bar {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 210px;
      height: 26px;
      background: ${STEEL};
      clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <!-- HEADER -->
    <div class="cv-header">
      <svg style="position:absolute;top:-10px;left:0;z-index:2;pointer-events:none;" width="140" height="155" viewBox="0 0 140 155">
        <polygon points="0,0 130,0 0,145" fill="${TAN}"/>
      </svg>

      <div class="name-block">
        ${currentRole ? `<p class="name-jobtitle">${currentRole}</p>` : ""}
        ${firstName   ? `<p class="name-first">${firstName}</p>`      : ""}
        ${lastName    ? `<p class="name-last">${lastName}</p>`        : ""}
      </div>

      <div class="photo-area">
        <div class="photo-tan-bg"></div>
        ${photoHtml}
      </div>
    </div>

    <!-- BODY -->
    <div class="cv-body">
      <div class="cv-left">
        ${contactHtml}
        ${skillsHtml}
        ${languagesHtml}
        ${hobbiesHtml}
        ${educationHtml}
      </div>
      <div class="cv-right">
        ${summaryHtml}
        ${experienceHtml}
        <div class="bottom-bar"></div>
      </div>
    </div>

  </div>
</body>
</html>`;
};