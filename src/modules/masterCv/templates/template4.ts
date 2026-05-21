export const generateTemp4Html = (data: any): string => {
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
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #333; background: #faf8f4; display: flex; min-height: 100vh; }

      .sidebar { width: 220px; min-width: 220px; background: #f0ebe0; display: flex; flex-direction: column; }
      .sidebar-photo { width: 100%; height: 190px; object-fit: cover; display: block; }
      .sidebar-photo-placeholder { width: 100%; height: 190px; background: #d4c5a9; display: flex; align-items: center; justify-content: center; font-size: 48px; }
      .sidebar-inner { padding: 18px 16px; }
      .sidebar-name { font-size: 16px; font-weight: 700; color: #333; margin-bottom: 2px; }
      .sidebar-title { font-size: 10px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }

      .sidebar-section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8B7355; border-top: 1px solid #c8b89a; padding-top: 10px; margin-bottom: 7px; }
      .sidebar p { font-size: 11px; color: #666; line-height: 1.65; margin-bottom: 12px; }
      .contact-block { font-size: 11px; color: #666; line-height: 1.85; }

      .main { flex: 1; padding: 28px 26px; }
      .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8B7355; border-bottom: 2px solid #d4c5a9; padding-bottom: 5px; margin-bottom: 14px; }

      .section-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 14px; }
      .dot { width: 7px; height: 7px; border-radius: 50%; background: #8B7355; margin-top: 5px; flex-shrink: 0; }
      .item-body { flex: 1; }
      .item-title { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 1px; }
      .item-role { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 1px; }
      .item-year { font-size: 11px; color: #8B7355; font-weight: 500; margin-bottom: 4px; }
      .item-year strong { color: #8B7355; }
      .section { margin-bottom: 22px; }
      ul { padding-left: 16px; }
      ul li { font-size: 11.5px; color: #666; line-height: 1.6; margin-bottom: 2px; }
    </style>
  </head>
  <body>
    <div class="sidebar">
      ${profileImage
        ? `<img class="sidebar-photo" src="${profileImage}" alt="Profile" />`
        : `<div class="sidebar-photo-placeholder">👤</div>`}
      <div class="sidebar-inner">
        <div class="sidebar-name">${name}</div>
        <div class="sidebar-title">${title}</div>
        <div class="sidebar-section-label">About</div>
        <p>${about}</p>
        <div class="sidebar-section-label">Contact</div>
        <div class="contact-block">
          <div>${email}</div>
          <div>${phone}</div>
          <div>${address}</div>
          ${linkedin ? `<div>${linkedin}</div>` : ""}
          ${portfolio ? `<div>${portfolio}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="main">
      <div class="section">
        <div class="section-title">Education</div>
        ${education.map((edu:any) => `
          <div class="section-item">
            <div class="dot"></div>
            <div class="item-body">
              <div class="item-title">${edu.degree}</div>
              <div class="item-year">${edu.institution} · ${edu.startYear}–${edu.endYear}</div>
              <ul>${edu.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="section">
        <div class="section-title">Experience</div>
        ${experience.map((exp:any) => `
          <div class="section-item">
            <div class="dot"></div>
            <div class="item-body">
              <div class="item-role">${exp.role}</div>
              <div class="item-year">${exp.company} · ${exp.startYear}–${exp.endYear}</div>
              <ul>${exp.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </body>
  </html>
  `;
};