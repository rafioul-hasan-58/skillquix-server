type IEducation = {
  startYear: string;
  endYear: string;
  institution: string;
  degree: string;
  points: string[];
};

type IExperience = {
  role: string;
  startYear: string;
  endYear: string;
  company: string;
  points: string[];
};

type IResumeData = {
  name: string;
  title: string;
  profileImage: string;
  about: string;
  email: string;
  address: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  education: IEducation[];
  experience: IExperience[];
};



export const generateTemp1Html = (data: IResumeData): string => {
  const {
    name = "",
    title = "",
    profileImage = "",
    about = "",
    email = "",
    address = "",
    phone = "",
    linkedin = "",
    portfolio = "",
    education = [],
    experience = [],
  } = data;

  const educationHtml = education.map((edu: IEducation) => `
    <div class="section-item">
      <div class="item-year">${edu.startYear} - ${edu.endYear} | <strong>${edu.institution}</strong></div>
      <div class="item-title">${edu.degree}</div>
      <ul>${edu.points.map((p: any) => `<li>${p}</li>`).join("")}</ul>
    </div>
  `).join("");

  const experienceHtml = experience.map((exp: IExperience) => `
    <div class="section-item">
      <div class="item-role">${exp.role}</div>
      <div class="item-year">${exp.startYear} - ${exp.endYear} | <strong>${exp.company}</strong></div>
      <ul>${exp.points.map((p: any) => `<li>${p}</li>`).join("")}</ul>
    </div>
  `).join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${name} - CV</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #333; display: flex; height: 100vh; }

      .sidebar { width: 220px; min-width: 220px; background: #1a2e3b; color: #fff; display: flex; flex-direction: column; }
      .sidebar-photo { width: 100%; height: 200px; object-fit: cover; display: block; }
      .sidebar-photo-placeholder { width: 100%; height: 200px; background: #2d4a5a; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #7a9bb0; }
      .sidebar-content { padding: 20px 18px; }
      .sidebar h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7fb3c8; margin-bottom: 8px; margin-top: 16px; border-bottom: 1px solid #2d4a5a; padding-bottom: 4px; }
      .sidebar p { font-size: 11.5px; color: #ccd9e0; line-height: 1.6; margin-bottom: 10px; }
      .contact-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 7px; font-size: 11px; color: #ccd9e0; word-break: break-word; }
      .contact-icon { min-width: 16px; color: #7fb3c8; font-size: 13px; margin-top: 1px; }

      .main { flex: 1; padding: 36px 36px 24px; background: #fff; overflow: hidden; }
      .main-header { margin-bottom: 22px; border-bottom: 2px solid #e8e8e8; padding-bottom: 14px; }
      .main-header h1 { font-size: 30px; font-weight: 700; color: #1a2e3b; letter-spacing: -0.5px; }
      .main-header .job-title { font-size: 13px; color: #7fb3c8; font-weight: 500; margin-top: 4px; }

      .section { margin-bottom: 22px; }
      .section-title { font-size: 13px; font-weight: 700; color: #1a7fa0; border-bottom: 1.5px solid #d0eaf5; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .section-item { margin-bottom: 14px; }
      .item-year { font-size: 11px; color: #777; margin-bottom: 2px; }
      .item-year strong { color: #1a7fa0; }
      .item-title { font-size: 13px; font-weight: 600; color: #1a2e3b; margin-bottom: 4px; }
      .item-role { font-size: 13px; font-weight: 700; color: #1a2e3b; margin-bottom: 2px; }
      ul { padding-left: 18px; }
      ul li { font-size: 12px; color: #555; line-height: 1.6; margin-bottom: 2px; }
    </style>
  </head>
  <body>
    <div class="sidebar">
      ${profileImage
      ? `<img class="sidebar-photo" src="${profileImage}" alt="Profile" />`
      : `<div class="sidebar-photo-placeholder">👤</div>`}
      <div class="sidebar-content">
        <h3>About Me</h3>
        <p>${about}</p>
        <h3>Contact</h3>
        <div class="contact-item"><span class="contact-icon">✉</span><span>${email}</span></div>
        <div class="contact-item"><span class="contact-icon">📍</span><span>${address}</span></div>
        <div class="contact-item"><span class="contact-icon">📞</span><span>${phone}</span></div>
        ${linkedin ? `<div class="contact-item"><span class="contact-icon">in</span><span>${linkedin}</span></div>` : ""}
        ${portfolio ? `<div class="contact-item"><span class="contact-icon">🌐</span><span>${portfolio}</span></div>` : ""}
      </div>
    </div>
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