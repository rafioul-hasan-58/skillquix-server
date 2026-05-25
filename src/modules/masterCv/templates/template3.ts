// ─── Types ────────────────────────────────────────────────────────────────────

type ITemp3Education = {
  degree: string;
  institution: string;
  honors: string[];
};

type ITemp3Experience = {
  title: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

type ITemp3ResumeData = {
  name: string;
  title: string;
  profileImage: string;
  profile: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  languages: string[];
  skills: string[];
  hobbies: string[];
  education: ITemp3Education[];
  experience: ITemp3Experience[];
};

// ─── Generator ────────────────────────────────────────────────────────────────

export const generateTemp3Html = (data: ITemp3ResumeData): string => {
  const {
    name = "",
    title = "",
    profileImage = "",
    profile = "",
    phone = "",
    email = "",
    website = "",
    address = "",
    languages = [],
    skills = [],
    hobbies = [],
    education = [],
    experience = [],
  } = data;

  // ── Helpers ──
  const bulletList = (items: string[]) =>
    items
      .map(
        (item) => `
      <div class="bullet-row">
        <span class="bullet-dot">•</span>
        <span class="bullet-text">${item}</span>
      </div>`
      )
      .join("");

  const leftSectionDivider = `<div class="left-divider"></div>`;

  const contactRow = (iconSvg: string, text: string) =>
    text
      ? `<div class="contact-row">
          <span class="contact-icon">${iconSvg}</span>
          <span class="contact-text">${text}</span>
         </div>`
      : "";

  // ── SVG icons ──
  const phoneIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
  const emailIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
  const websiteIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`;
  const addressIcon = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;

  // ── Education HTML ──
  const educationHtml = education
    .map(
      (edu: ITemp3Education, i: number) => `
    <div class="edu-item" ${i < education.length - 1 ? 'style="margin-bottom:12px"' : ""}>
      ${edu.degree ? `<p class="edu-degree">${edu.degree}</p>` : ""}
      ${edu.institution ? `<p class="edu-institution">${edu.institution}</p>` : ""}
      ${
        edu.honors && edu.honors.length > 0
          ? `<div style="padding-left:4px">${bulletList(edu.honors)}</div>`
          : ""
      }
    </div>`
    )
    .join("");

  // ── Experience HTML ──
  const experienceHtml = experience
    .map(
      (exp: ITemp3Experience, i: number) => `
    <div class="exp-item" ${i < experience.length - 1 ? 'style="margin-bottom:16px"' : ""}>
      ${exp.title ? `<p class="exp-title">${exp.title}</p>` : ""}
      ${
        exp.company || exp.location || exp.period
          ? `<p class="exp-meta">
              ${[exp.company, exp.location].filter(Boolean).join(", ")}
              ${exp.period ? `<br/>${exp.period}` : ""}
             </p>`
          : ""
      }
      ${
        exp.points && exp.points.length > 0
          ? `<div>${bulletList(exp.points)}</div>`
          : ""
      }
    </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} - CV</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Trebuchet MS', 'Gill Sans', 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #333;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* ── CV Card ── */
    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: #ffffff;
      overflow: hidden;
    }

    /* ─────────────────────────────────────
       HEADER
    ───────────────────────────────────── */
    .header {
      padding: 32px 32px 0 32px;
    }

    .header-inner {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .header-left {
      flex: 1;
      padding-right: 24px;
    }

    .header-name {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0f172a;
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .header-title {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.22em;
      color: #374151;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .header-profile {
      font-size: 11.5px;
      color: #4b5563;
      line-height: 1.65;
      max-width: 360px;
    }

    .header-photo {
      width: 130px;
      height: 140px;
      object-fit: cover;
      object-position: center top;
      display: block;
      flex-shrink: 0;
    }

    .header-photo-placeholder {
      width: 130px;
      height: 140px;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-divider {
      height: 1px;
      background: #d1d5db;
      margin-top: 20px;
    }

    /* ─────────────────────────────────────
       BODY — two columns
    ───────────────────────────────────── */
    .body {
      display: flex;
      padding-bottom: 32px;
    }

    /* ── LEFT COLUMN ── */
    .left-col {
      width: 210px;
      min-width: 210px;
      padding: 20px 20px 0 32px;
    }

    .left-section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #1f2937;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .left-divider {
      height: 1px;
      background: #d1d5db;
      margin: 14px 0 12px 0;
    }

    /* Contact rows */
    .contact-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
    }

    .contact-icon {
      flex-shrink: 0;
      margin-top: 1px;
      color: #6b7280;
      display: flex;
    }

    .contact-text {
      font-size: 11px;
      color: #374151;
      line-height: 1.45;
      word-break: break-word;
    }

    /* Bullet rows (languages / skills / hobbies) */
    .bullet-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
    }

    .bullet-dot {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.4;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .bullet-text {
      font-size: 11px;
      color: #374151;
      line-height: 1.5;
    }

    /* ── Vertical divider ── */
    .col-divider {
      width: 1px;
      background: #d1d5db;
      align-self: stretch;
      flex-shrink: 0;
    }

    /* ── RIGHT COLUMN ── */
    .right-col {
      flex: 1;
      padding: 20px 32px 0 24px;
      min-width: 0;
    }

    .right-section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #1f2937;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .right-divider {
      height: 1px;
      background: #d1d5db;
      margin: 0 0 16px 0;
    }

    /* Education */
    .edu-degree {
      font-size: 11px;
      font-weight: 700;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      line-height: 1.4;
      margin-bottom: 2px;
    }

    .edu-institution {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    /* Experience */
    .exp-title {
      font-size: 11px;
      font-weight: 700;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1px;
    }

    .exp-meta {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <!-- ══ HEADER ══ -->
    <div class="header">
      <div class="header-inner">

        <!-- Left: name + title + profile -->
        <div class="header-left">
          <h1 class="header-name">${name}</h1>
          ${title ? `<p class="header-title">${title}</p>` : ""}
          ${profile ? `<p class="header-profile">${profile}</p>` : ""}
        </div>

        <!-- Photo -->
        ${
          profileImage
            ? `<img class="header-photo" src="${profileImage}" alt="${name}" />`
            : `<div class="header-photo-placeholder">
                <svg width="56" height="56" fill="#9ca3af" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
               </div>`
        }

      </div>
      <div class="header-divider"></div>
    </div>

    <!-- ══ BODY ══ -->
    <div class="body">

      <!-- ── LEFT COLUMN ── -->
      <div class="left-col">

        <!-- Contact -->
        <p class="left-section-title">Contact</p>
        ${contactRow(phoneIcon, phone)}
        ${contactRow(emailIcon, email)}
        ${contactRow(websiteIcon, website)}
        ${contactRow(addressIcon, address)}

        <!-- Languages -->
        ${
          languages.length > 0
            ? `${leftSectionDivider}
               <p class="left-section-title">Languages</p>
               ${bulletList(languages)}`
            : ""
        }

        <!-- Skills -->
        ${
          skills.length > 0
            ? `${leftSectionDivider}
               <p class="left-section-title">Skills</p>
               ${bulletList(skills)}`
            : ""
        }

        <!-- Hobbies -->
        ${
          hobbies.length > 0
            ? `${leftSectionDivider}
               <p class="left-section-title">Hobbies</p>
               ${bulletList(hobbies)}`
            : ""
        }

      </div>

      <!-- Vertical divider -->
      <div class="col-divider"></div>

      <!-- ── RIGHT COLUMN ── -->
      <div class="right-col">

        <!-- Education -->
        ${
          education.length > 0
            ? `<p class="right-section-title">Education</p>
               <div style="margin-bottom:16px">${educationHtml}</div>`
            : ""
        }

        <!-- Divider between education and experience -->
        ${education.length > 0 && experience.length > 0 ? `<div class="right-divider"></div>` : ""}

        <!-- Work Experience -->
        ${
          experience.length > 0
            ? `<p class="right-section-title">Work Experience</p>
               <div>${experienceHtml}</div>`
            : ""
        }

      </div>
    </div>

  </div>
</body>
</html>
  `;
};