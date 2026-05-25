// ─── Types ────────────────────────────────────────────────────────────────────

type ITemp2Education = {
  startYear: string;
  endYear: string;
  institution: string;
  degree: string;
  gpa: string;
};

type ITemp2Experience = {
  company: string;
  role: string;
  points: string[];
};

type ITemp2ResumeData = {
  name: string;
  title: string;
  profileImage: string;
  profile: string;
  skills: string[];
  email: string;
  address: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  education: ITemp2Education[];
  experience: ITemp2Experience[];
};

// ─── Generator ────────────────────────────────────────────────────────────────

export const generateTemp2Html = (data: ITemp2ResumeData): string => {
  const {
    name = "",
    title = "",
    profileImage = "",
    profile = "",
    skills = [],
    email = "",
    address = "",
    phone = "",
    linkedin = "",
    portfolio = "",
    education = [],
    experience = [],
  } = data;

  // ── Education (sidebar) ──
  const educationHtml = education
    .map(
      (edu: ITemp2Education) => `
    <div class="edu-item">
      <p class="edu-period">${edu.startYear} - ${edu.endYear}</p>
      <p class="edu-institution">${edu.institution}</p>
      ${edu.degree ? `<p class="edu-degree">• ${edu.degree}</p>` : ""}
      ${edu.gpa ? `<p class="edu-gpa">GPA: ${edu.gpa}</p>` : ""}
    </div>`
    )
    .join("");

  // ── Skills (sidebar) ──
  const skillsHtml = skills
    .map(
      (s: string) => `
    <li class="skill-item"><span class="skill-dot">•</span>${s}</li>`
    )
    .join("");

  // ── Experience (main) ──
  const experienceHtml = experience
    .map(
      (exp: ITemp2Experience) => `
    <div class="exp-item">
      ${exp.company ? `<p class="exp-company">${exp.company}</p>` : ""}
      ${exp.role ? `<p class="exp-role">${exp.role}</p>` : ""}
      ${
        exp.points && exp.points.length > 0
          ? `<ul class="exp-bullets">
          ${exp.points
            .map(
              (b: string) => `
            <li><span class="bullet-dot">•</span>${b}</li>`
            )
            .join("")}
        </ul>`
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
      font-family: 'Segoe UI', Arial, sans-serif;
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
      display: flex;
      flex-direction: row;
    }

    /* ─────────────────────────────────────
       LEFT SIDEBAR
    ───────────────────────────────────── */
    .sidebar {
      width: 192px;
      min-width: 192px;
      background: #E3EAF1;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    /* Profile photo */
    .sidebar-photo-wrap {
      width: 130px;
      height: 130px;
      margin: 20px auto 0;
      border-radius: 50%;
      overflow: hidden;
      background: #d1d5db;
      flex-shrink: 0;
    }

    .sidebar-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    .sidebar-photo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #d1d5db;
    }

    .sidebar-photo-placeholder svg {
      width: 64px;
      height: 64px;
      color: #9ca3af;
    }

    /* Sidebar content */
    .sidebar-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }

    /* Sidebar section heading */
    .sidebar-heading {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #374151;
      border-bottom: 1px solid #407296;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    /* Contact */
    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .contact-icon {
      flex-shrink: 0;
      margin-top: 1px;
      color: #6b7280;
      width: 14px;
      height: 14px;
    }

    .contact-text {
      font-size: 11px;
      color: #374151;
      line-height: 1.45;
      word-break: break-word;
    }

    /* Education (sidebar) */
    .edu-item {
      margin-bottom: 12px;
    }

    .edu-item:last-child { margin-bottom: 0; }

    .edu-period {
      font-size: 10.5px;
      color: #6b7280;
    }

    .edu-institution {
      font-size: 11px;
      font-weight: 600;
      color: #3d6ea8;
      line-height: 1.35;
    }

    .edu-degree {
      font-size: 11px;
      color: #4b5563;
      line-height: 1.35;
    }

    .edu-gpa {
      font-size: 10.5px;
      color: #6b7280;
    }

    /* Skills (sidebar) */
    .skills-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skill-item {
      font-size: 11px;
      color: #374151;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .skill-dot {
      color: #9ca3af;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* ─────────────────────────────────────
       RIGHT MAIN
    ───────────────────────────────────── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* Dark header banner */
    .main-header {
      background: #1a2e4a;
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .main-header-inner {
      border: 1px solid rgba(255,255,255,0.25);
      padding: 20px 32px;
      text-align: center;
    }

    .main-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
      line-height: 1.15;
    }

    .main-header .job-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.25em;
      color: rgba(255,255,255,0.7);
      margin-top: 6px;
      text-transform: uppercase;
    }

    /* Main content body */
    .main-body {
      padding: 24px 28px;
      flex: 1;
    }

    /* Section label with horizontal rule */
    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      margin-top: 20px;
    }

    .section-label:first-child {
      margin-top: 0;
    }

    .section-label-text {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #374151;
      white-space: nowrap;
    }

    .section-label-line {
      flex: 1;
      height: 1px;
      background: #d1d5db;
    }

    /* Profile text */
    .profile-text {
      font-size: 12px;
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 4px;
    }

    /* Experience */
    .exp-item {
      margin-bottom: 20px;
    }

    .exp-item:last-child { margin-bottom: 0; }

    .exp-company {
      font-size: 13px;
      font-weight: 700;
      color: #1f2937;
    }

    .exp-role {
      font-size: 11.5px;
      font-weight: 600;
      color: #3d6ea8;
      margin-bottom: 5px;
    }

    .exp-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .exp-bullets li {
      font-size: 12px;
      color: #4b5563;
      display: flex;
      align-items: flex-start;
      gap: 6px;
      line-height: 1.55;
    }

    .bullet-dot {
      color: #9ca3af;
      flex-shrink: 0;
      margin-top: 1px;
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <!-- ── LEFT SIDEBAR ── -->
    <aside class="sidebar">

      <!-- Profile Photo -->
      <div class="sidebar-photo-wrap">
        ${
          profileImage
            ? `<img class="sidebar-photo" src="${profileImage}" alt="${name}" />`
            : `<div class="sidebar-photo-placeholder">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
               </div>`
        }
      </div>

      <div class="sidebar-content">

        <!-- Contact -->
        <div>
          <p class="sidebar-heading">Contact</p>
          <div class="contact-list">
            ${
              email
                ? `<div class="contact-item">
                    <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="contact-text">${email}</span>
                   </div>`
                : ""
            }
            ${
              address
                ? `<div class="contact-item">
                    <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="contact-text">${address}</span>
                   </div>`
                : ""
            }
            ${
              phone
                ? `<div class="contact-item">
                    <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="contact-text">${phone}</span>
                   </div>`
                : ""
            }
            ${
              linkedin
                ? `<div class="contact-item">
                    <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    <span class="contact-text">${linkedin}</span>
                   </div>`
                : ""
            }
            ${
              portfolio
                ? `<div class="contact-item">
                    <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                    <span class="contact-text">${portfolio}</span>
                   </div>`
                : ""
            }
          </div>
        </div>

        <!-- Education -->
        ${
          education.length > 0
            ? `<div>
                <p class="sidebar-heading">Education</p>
                ${educationHtml}
               </div>`
            : ""
        }

        <!-- Skills -->
        ${
          skills.length > 0
            ? `<div>
                <p class="sidebar-heading">Skills</p>
                <ul class="skills-list">${skillsHtml}</ul>
               </div>`
            : ""
        }

      </div>
    </aside>

    <!-- ── RIGHT MAIN ── -->
    <main class="main">

      <!-- Dark header banner -->
      <div class="main-header">
        <div class="main-header-inner">
          <h1>${name}</h1>
          ${title ? `<p class="job-title">${title}</p>` : ""}
        </div>
      </div>

      <!-- Content body -->
      <div class="main-body">

        <!-- Profile -->
        ${
          profile
            ? `<div class="section-label">
                <span class="section-label-text">Profile</span>
                <div class="section-label-line"></div>
               </div>
               <p class="profile-text">${profile}</p>`
            : ""
        }

        <!-- Work Experience -->
        ${
          experience.length > 0
            ? `<div class="section-label" style="margin-top: 20px;">
                <span class="section-label-text">Work Experience</span>
                <div class="section-label-line"></div>
               </div>
               <div>${experienceHtml}</div>`
            : ""
        }

      </div>
    </main>

  </div>
</body>
</html>
  `;
};