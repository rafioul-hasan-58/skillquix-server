export const generateTemp2Html = (data: any): string => {
  const { name, title, profileImage, about, email, address, phone, linkedin, portfolio, education, experience } = data;

  const educationHtml = education.map((edu:any) => `
    <div class="section-item">
      <div class="item-year">${edu.startYear} - ${edu.endYear} | <strong>${edu.institution}</strong></div>
      <div class="item-title">${edu.degree}</div>
      <ul>${edu.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
    </div>
  `).join("");

  const experienceHtml = experience.map((exp:any) => `
    <div class="section-item">
      <div class="item-role">${exp.role}</div>
      <div class="item-year">${exp.startYear} - ${exp.endYear} | <strong>${exp.company}</strong></div>
      <ul>${exp.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
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
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }

      .header { background: #185FA5; padding: 28px 32px; display: flex; align-items: center; gap: 22px; }
      .header-photo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.45); }
      .header-photo-placeholder { width: 84px; height: 84px; border-radius: 50%; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; font-size: 32px; }
      .header-info h1 { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
      .header-info .job-title { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }
      .header-info .contact-line { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 6px; }

      .body { display: grid; grid-template-columns: 1fr 1fr; }
      .col-left { padding: 24px 22px 24px 32px; border-right: 1px solid #eee; }
      .col-right { padding: 24px 32px 24px 22px; }

      .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #185FA5; margin-bottom: 10px; }
      .about-text { font-size: 12px; color: #555; line-height: 1.7; margin-bottom: 18px; }
      .contact-block { font-size: 12px; color: #444; line-height: 1.9; margin-bottom: 18px; }

      .section-item { margin-bottom: 14px; padding-left: 12px; border-left: 3px solid #185FA5; }
      .item-year { font-size: 11px; color: #185FA5; font-weight: 500; margin-bottom: 1px; }
      .item-year strong { color: #185FA5; }
      .item-title { font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px; }
      .item-role { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 2px; }
      ul { padding-left: 16px; }
      ul li { font-size: 11.5px; color: #555; line-height: 1.6; margin-bottom: 2px; }
    </style>
  </head>
  <body>
    <div class="header">
      ${profileImage
        ? `<img class="header-photo" src="${profileImage}" alt="Profile" />`
        : `<div class="header-photo-placeholder">👤</div>`}
      <div class="header-info">
        <h1>${name}</h1>
        <div class="job-title">${title}</div>
        <div class="contact-line">${email} · ${phone}</div>
      </div>
    </div>
    <div class="body">
      <div class="col-left">
        <div class="section-label">About</div>
        <div class="about-text">${about}</div>
        <div class="section-label">Contact</div>
        <div class="contact-block">
          <div>📍 ${address}</div>
          ${linkedin ? `<div>in ${linkedin}</div>` : ""}
          ${portfolio ? `<div>🌐 ${portfolio}</div>` : ""}
        </div>
        <div class="section-label">Education</div>
        ${educationHtml}
      </div>
      <div class="col-right">
        <div class="section-label">Experience</div>
        ${experienceHtml}
      </div>
    </div>
  </body>
  </html>
  `;
};