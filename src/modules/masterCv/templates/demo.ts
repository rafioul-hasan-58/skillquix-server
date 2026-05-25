// ── Types ──────────────────────────────────────────────
export interface EducationEntry {
  startYear: string;
  endYear: string;
  institution: string;
  degree: string;
  points: string[];
}

export interface ExperienceEntry {
  role: string;
  startYear: string;
  endYear: string;
  company: string;
  points: string[];
}

export interface CvData {
  name: string;
  title: string;
  profileImage?: string; // URL or base64
  about: string;
  email: string;
  address: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

export const generateCvHtml = (data: CvData): string => {
  const {
    name,
    title,
    profileImage,
    about,
    email,
    address,
    phone,
    linkedin,
    portfolio,
    education,
    experience,
  } = data;

  const educationHtml = education
    .map(
      (edu) => `
      <div class="section-item">
        <div class="item-year">${edu.startYear} - ${edu.endYear} | <strong>${edu.institution}</strong></div>
        <div class="item-title">${edu.degree}</div>
        <ul>
          ${edu.points.map((p) => `<li>${p}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");

  const experienceHtml = experience
    .map(
      (exp) => `
      <div class="section-item">
        <div class="item-role">${exp.role}</div>
        <div class="item-year">${exp.startYear} - ${exp.endYear} | <strong>${exp.company}</strong></div>
        <ul>
          ${exp.points.map((p) => `<li>${p}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${name} - CV</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        color: #333;
        display: flex;
        height: 100vh;
      }

      /* ── LEFT SIDEBAR ── */
      .sidebar {
        width: 220px;
        min-width: 220px;
        background: #1a2e3b;
        color: #fff;
        padding: 0;
        display: flex;
        flex-direction: column;
      }

      .sidebar-photo {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }

      .sidebar-photo-placeholder {
        width: 100%;
        height: 200px;
        background: #2d4a5a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: #7a9bb0;
      }

      .sidebar-content {
        padding: 20px 18px;
      }

      .sidebar h3 {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #7fb3c8;
        margin-bottom: 10px;
        margin-top: 18px;
        border-bottom: 1px solid #2d4a5a;
        padding-bottom: 5px;
      }

      .sidebar p {
        font-size: 12px;
        color: #ccd9e0;
        line-height: 1.6;
        margin-bottom: 10px;
      }

      .contact-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 11.5px;
        color: #ccd9e0;
        word-break: break-word;
      }

      .contact-icon {
        min-width: 16px;
        color: #7fb3c8;
        font-size: 13px;
        margin-top: 1px;
      }

      /* ── MAIN CONTENT ── */
      .main {
        flex: 1;
        padding: 36px 36px 24px 36px;
        background: #fff;
        overflow: hidden;
      }

      .main-header {
        margin-bottom: 24px;
        border-bottom: 2px solid #e8e8e8;
        padding-bottom: 16px;
      }

      .main-header h1 {
        font-size: 30px;
        font-weight: 700;
        color: #1a2e3b;
        letter-spacing: -0.5px;
      }

      .main-header .job-title {
        font-size: 14px;
        color: #7fb3c8;
        font-weight: 500;
        margin-top: 4px;
      }

      .section {
        margin-bottom: 22px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 700;
        color: #1a7fa0;
        border-bottom: 1.5px solid #d0eaf5;
        padding-bottom: 4px;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .section-item {
        margin-bottom: 14px;
      }

      .item-year {
        font-size: 12px;
        color: #666;
        margin-bottom: 2px;
      }

      .item-year strong {
        color: #1a7fa0;
      }

      .item-title {
        font-size: 13px;
        font-weight: 600;
        color: #1a2e3b;
        margin-bottom: 4px;
      }

      .item-role {
        font-size: 13px;
        font-weight: 700;
        color: #1a2e3b;
        margin-bottom: 2px;
      }

      ul {
        padding-left: 18px;
      }

      ul li {
        font-size: 12px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 2px;
      }
    </style>
  </head>
  <body>

    <!-- SIDEBAR -->
    <div class="sidebar">
      ${
        profileImage
          ? `<img class="sidebar-photo" src="${profileImage}" alt="Profile Photo" />`
          : `<div class="sidebar-photo-placeholder">👤</div>`
      }
      <div class="sidebar-content">
        <h3>About Me</h3>
        <p>${about}</p>

        <h3>Contact</h3>
        <div class="contact-item">
          <span class="contact-icon">✉</span>
          <span>${email}</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <span>${address}</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>${phone}</span>
        </div>
        ${
          linkedin
            ? `<div class="contact-item">
                <span class="contact-icon">in</span>
                <span>${linkedin}</span>
              </div>`
            : ""
        }
        ${
          portfolio
            ? `<div class="contact-item">
                <span class="contact-icon">🌐</span>
                <span>${portfolio}</span>
              </div>`
            : ""
        }
      </div>
    </div>

    <!-- MAIN -->
    <div class="main">
      <div class="main-header">
        <h1>${name}</h1>
        <div class="job-title">${title}</div>
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        ${educationHtml}
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        ${experienceHtml}
      </div>
    </div>

  </body>
  </html>
  `;
};
