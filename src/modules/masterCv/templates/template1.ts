// ── Types matching DB fields exactly ──────────────────────────

type IEducation = {
  degree: string;
  certificateName?: string;
  institution: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
};

type IExperience = {
  company: string;
  position: string;      // DB field (not title/role)
  duration: string;      // DB field (not period)
  responsibilities?: string;
  projects?: string[];   // DB field — used as bullet list
};

type IResumeData = {
  fullName: string;
  currentRole: string;
  resumeSummary: string;  // DB field (not about)
  email: string;
  location: string;
  phoneNumber: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  educationsAndCertifications: IEducation[];
  workExperiences: IExperience[];
  user?: { profileImage?: string };
};

// ── Template generator ─────────────────────────────────────────
export const generateTemp1Html = (data: IResumeData): string => {
  const {
    fullName = "",
    currentRole = "",
    resumeSummary = "",
    email = "",
    location = "",
    phoneNumber = "",
    linkedinUrl = "",
    portfolioUrl = "",
    educationsAndCertifications = [],
    workExperiences = [],
    user,
  } = data;

  const profileImage = user?.profileImage ?? "";

  const educationHtml = educationsAndCertifications
    .map(
      (edu: IEducation) => `
    <div class="section-item">
      ${edu.degree ? `<p class="item-degree">${edu.degree}</p>` : ""}
      <p class="item-meta">
        ${edu.passingYear ? `<span>${edu.passingYear} | </span>` : ""}
        <span class="item-institution">${edu.institution}</span>
      </p>
      ${edu.certificateName
          ? `<p class="item-cert">${edu.certificateName}${edu.organizationName ? ` — ${edu.organizationName}` : ""}</p>`
          : ""
        }
      ${edu.issueDate
          ? `<p class="item-issue">Issued: ${edu.issueDate}</p>`
          : ""
        }
    </div>
  `
    )
    .join("");

  const experienceHtml = workExperiences
    .map(
      (exp: IExperience) => `
    <div class="section-item section-item--experience">
      ${exp.position ? `<p class="item-role">${exp.position}</p>` : ""}
      <p class="item-meta">
        ${exp.duration ? `<span>${exp.duration} | </span>` : ""}
        <span class="item-institution">${exp.company}</span>
      </p>
      ${exp.responsibilities ? `<p class="item-responsibilities">${exp.responsibilities}</p>` : ""}
      ${exp.projects && exp.projects.length > 0
          ? `<ul>${exp.projects.map((p: string) => `<li>${p}</li>`).join("")}</ul>`
          : ""
        }
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName} - CV</title>
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

    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: row;
    }

    /* ── LEFT SIDEBAR ── */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: #4a7eab;
      display: flex;
      flex-direction: column;
    }

    .sidebar-photo-wrap {
      width: 260px;
      height: 260px;
      background: #295C81;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
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
      width: 80px;
      height: 80px;
      color: rgba(255,255,255,0.3);
    }

    .sidebar-content {
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
    }

    .sidebar-section-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .about-text {
      color: rgba(255,255,255,0.85);
      font-size: 11px;
      line-height: 1.65;
    }

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
      margin-top: 1px;
      flex-shrink: 0;
      color: rgba(255,255,255,0.75);
      width: 14px;
      height: 14px;
    }

    .contact-text {
      font-size: 11px;
      color: rgba(255,255,255,0.9);
      line-height: 1.45;
      word-break: break-word;
    }

    /* ── RIGHT MAIN ── */
    .main {
      flex: 1;
      padding: 32px 36px;
      min-width: 0;
    }

    .main-header {
      margin-bottom: 20px;
    }

    .main-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }

    .main-header .job-title {
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      margin-top: 4px;
    }

    .section {
      margin-bottom: 4px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      margin-top: 20px;
    }

    .section-header:first-child {
      margin-top: 0;
    }

    .section-title {
      color: #b5861a;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
    }

    .section-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, #c8970a, rgba(232,200,71,0.25));
    }

    .section-item {
      margin-bottom: 14px;
    }

    .section-item:last-child {
      margin-bottom: 0;
    }

    .section-item--experience {
      margin-bottom: 18px;
    }

    .item-degree {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .item-cert {
      font-size: 11px;
      color: #4a7eab;
      margin-top: 3px;
    }

    .item-issue {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .item-role {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .item-meta {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .item-institution {
      color: #3d6ea8;
    }

    .item-responsibilities {
      font-size: 12px;
      color: #4b5563;
      line-height: 1.55;
      margin-bottom: 5px;
    }

    ul {
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    ul li {
      font-size: 12px;
      color: #4b5563;
      line-height: 1.55;
      list-style-type: disc;
    }
  </style>
</head>
<body>
  <div class="cv-card">

    <aside class="sidebar">
      <div class="sidebar-photo-wrap">
        ${profileImage
      ? `<img class="sidebar-photo" src="${profileImage}" alt="${fullName}" />`
      : `<svg class="sidebar-photo-placeholder" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>`
    }
      </div>

      <div class="sidebar-content">

        ${resumeSummary
      ? `<div>
                <h3 class="sidebar-section-title">About Me</h3>
                <p class="about-text">${resumeSummary}</p>
               </div>`
      : ""
    }

        <div>
          <h3 class="sidebar-section-title">Contact</h3>
          <div class="contact-list">
            ${email ? `
            <div class="contact-item">
              <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="contact-text">${email}</span>
            </div>` : ""}

            ${location ? `
            <div class="contact-item">
              <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="contact-text">${location}</span>
            </div>` : ""}

            ${phoneNumber ? `
            <div class="contact-item">
              <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span class="contact-text">${phoneNumber}</span>
            </div>` : ""}

            ${linkedinUrl ? `
            <div class="contact-item">
              <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              <span class="contact-text">${linkedinUrl}</span>
            </div>` : ""}

            ${portfolioUrl ? `
            <div class="contact-item">
              <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              <span class="contact-text">${portfolioUrl}</span>
            </div>` : ""}
          </div>
        </div>

      </div>
    </aside>

    <main class="main">
      <div class="main-header">
        <h1>${fullName}</h1>
        ${currentRole ? `<p class="job-title">${currentRole}</p>` : ""}
      </div>

      ${educationsAndCertifications.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <span class="section-title">Education</span>
          <div class="section-line"></div>
        </div>
        ${educationHtml}
      </div>` : ""}

      ${workExperiences.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <span class="section-title">Experience</span>
          <div class="section-line"></div>
        </div>
        ${experienceHtml}
      </div>` : ""}

    </main>
  </div>
</body>
</html>
  `;
};