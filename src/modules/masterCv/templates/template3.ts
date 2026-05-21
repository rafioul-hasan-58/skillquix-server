export const generateTemp3Html = (data: any): string => {
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
      body { font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: #222; background: #fff; padding: 44px 40px; max-width: 780px; margin: 0 auto; }

      .header { text-align: center; margin-bottom: 26px; }
      .header h1 { font-size: 32px; font-weight: normal; letter-spacing: 3px; text-transform: uppercase; color: #111; }
      .header .job-title { font-size: 12px; color: #999; margin-top: 6px; letter-spacing: 1.5px; text-transform: uppercase; }
      .header .contact-line { font-size: 11px; color: #bbb; margin-top: 8px; }

      hr { border: none; border-top: 1px solid #ddd; margin: 0 0 24px; }
      hr.thin { border-top-color: #eee; }

      .section-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; margin-bottom: 12px; }

      .about-text { font-size: 12.5px; color: #444; line-height: 1.8; margin-bottom: 24px; }

      .section-item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .section-item-left { flex: 1; }
      .section-item-year { font-size: 11px; color: #bbb; white-space: nowrap; margin-left: 14px; padding-top: 2px; }
      .item-title { font-size: 13px; font-weight: 600; color: #111; margin-bottom: 2px; }
      .item-role { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 2px; }
      .item-sub { font-size: 11.5px; color: #999; margin-bottom: 4px; }
      .item-year strong { color: #999; }
      ul { padding-left: 16px; margin-top: 4px; }
      ul li { font-size: 11.5px; color: #555; line-height: 1.6; margin-bottom: 2px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${name}</h1>
      <div class="job-title">${title}</div>
      <div class="contact-line">${email} · ${phone} · ${address}${linkedin ? ` · ${linkedin}` : ""}${portfolio ? ` · ${portfolio}` : ""}</div>
    </div>
    <hr />
    <div class="section-label">Profile</div>
    <div class="about-text">${about}</div>
    <hr class="thin" />
    <div class="section-label">Education</div>
    ${education.map((edu:any) => `
      <div class="section-item">
        <div class="section-item-left">
          <div class="item-title">${edu.degree}</div>
          <div class="item-sub">${edu.institution}</div>
          <ul>${edu.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="section-item-year">${edu.startYear}–${edu.endYear}</div>
      </div>
    `).join("")}
    <hr class="thin" />
    <div class="section-label">Experience</div>
    ${experience.map((exp:any) => `
      <div class="section-item">
        <div class="section-item-left">
          <div class="item-role">${exp.role}</div>
          <div class="item-sub">${exp.company}</div>
          <ul>${exp.points.map((p:any) => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="section-item-year">${exp.startYear}–${exp.endYear}</div>
      </div>
    `).join("")}
  </body>
  </html>
  `;
};