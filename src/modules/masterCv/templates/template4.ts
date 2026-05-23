// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ITemp4Education {
  degree?: string;
  university?: string;
  period?: string;
  gpa?: string;
}

export interface ITemp4Experience {
  role?: string;
  company?: string;
  bullets?: string[];
}

export interface ITemp4ResumeData {
  name?: string;
  title?: string;
  profileImage?: string;
  profile?: string;
  address?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  certifications?: string[];
  education?: ITemp4Education[];
  experience?: ITemp4Experience[];
}

// ─── Generator ─────────────────────────────────────────────────────────────────

export const generateTemp4Html = (data: ITemp4ResumeData): string => {
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

  const skillsHtml =
    data.skills && data.skills.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Skill")}
          ${data.skills.map((s) => cvBullet(s)).join("")}
        </div>`
      : "";

  const certificationsHtml =
    data.certifications && data.certifications.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Certifications")}
          ${data.certifications.map((c) => cvBullet(c, true)).join("")}
        </div>`
      : "";

  const educationHtml =
    data.education && data.education.length > 0
      ? `<div style="margin-bottom:18px;">
          ${sectionLabel("Education")}
          ${data.education
            .map(
              (e, i) => `
            <div style="margin-bottom:${i < (data.education?.length ?? 1) - 1 ? "12px" : "0"};">
              ${e.degree ? `<p style="font-family:${F};font-size:11.5px;font-weight:600;color:#1f2937;margin:0 0 1px 0;">${e.degree}</p>` : ""}
              ${e.university ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 1px 0;">${e.university}</p>` : ""}
              ${e.period && !(e.university ?? "").includes(e.period) ? `<p style="font-family:${F};font-size:11px;color:#6b7280;margin:0 0 1px 0;">${e.period}</p>` : ""}
              ${e.gpa ? `<p style="font-family:${F};font-size:11px;color:#374151;margin:0;">${e.gpa}</p>` : ""}
            </div>
          `
            )
            .join("")}
        </div>`
      : "";

  const experienceHtml =
    data.experience && data.experience.length > 0
      ? `<div>
          ${sectionLabel("Experience")}
          ${data.experience
            .map(
              (exp, i) => `
            <div style="margin-bottom:${i < (data.experience?.length ?? 1) - 1 ? "14px" : "0"};">
              ${exp.role ? `<p style="font-family:${F};font-size:11.5px;font-weight:700;font-style:italic;color:#1f2937;margin:0 0 1px 0;">${exp.role}</p>` : ""}
              ${exp.company ? `<p style="font-family:${F};font-size:11.5px;font-weight:700;font-style:italic;color:#111827;margin:0 0 5px 0;">${exp.company}</p>` : ""}
              ${
                exp.bullets && exp.bullets.length > 0
                  ? `<div>${exp.bullets.map((b) => cvBullet(b)).join("")}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>`
      : "";

  const profileHtml = data.profile
    ? `<div style="margin-bottom:18px;">
        ${sectionLabel("Profile")}
        <p style="font-family:${F};font-size:11px;color:#374151;line-height:1.65;text-align:justify;margin:0;">${data.profile}</p>
      </div>`
    : "";

  const addressHtml = data.address
    ? `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
        <span style="margin-top:1px;flex-shrink:0;color:#374151;">
          <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="10" r="3" stroke-width="2"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </span>
        <span style="font-family:${F};font-size:11px;color:#374151;line-height:1.45;">${data.address}</span>
      </div>`
    : "";

  const phoneHtml = data.phone
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <svg style="width:12px;height:12px;flex-shrink:0;color:#374151;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <span style="font-family:${F};font-size:11px;color:#374151;">${data.phone}</span>
      </div>`
    : "";

  const emailHtml = data.email
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <svg style="width:12px;height:12px;flex-shrink:0;color:#374151;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <span style="font-family:${F};font-size:11px;color:#374151;">${data.email}</span>
      </div>`
    : "";

  const contactHtml = data.address || data.phone || data.email
    ? `<div style="margin-bottom:18px;">
        ${sectionLabel("Contact")}
        ${addressHtml}
        ${phoneHtml}
        ${emailHtml}
      </div>`
    : "";

  const photoHtml = data.profileImage
    ? `<img src="${data.profileImage}" alt="${data.name ?? "Profile photo"}" style="width:160px;height:170px;object-fit:cover;object-position:top;display:block;" />`
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
  <title>${data.name ?? "CV"} – Resume</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ddd6fe;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    /* ── Card ── */
    .cv-card {
      width: 100%;
      min-height: 100vh;
      background: #ddd6fe;
      overflow: hidden;
      position: relative;
    }

    /* ── Header ── */
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

    /* ── Decorations ── */
    .deco-top-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      height: 60px;
      pointer-events: none;
      overflow: hidden;
      z-index: 2;
    }
    .deco-top-left-accent {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      background: #1e2d4a;
    }
    .deco-top-right {
      position: absolute;
      top: 0;
      right: 0;
      width: 70px;
      height: 90px;
      pointer-events: none;
      z-index: 2;
    }
    .deco-top-right-back {
      position: absolute;
      top: 0;
      right: 24px;
      width: 32px;
      height: 70px;
      background: #c4b5fd;
      opacity: 0.55;
    }
    .deco-top-right-front {
      position: absolute;
      top: 0;
      right: 0;
      width: 22px;
      height: 90px;
      background: #7c3aed;
      opacity: 0.75;
    }
    .deco-top-right-accent {
      position: absolute;
      top: 14px;
      right: 24px;
      width: 22px;
      height: 22px;
      background: #ddd6fe;
    }
    .deco-bottom-left {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 80px;
      height: 48px;
      pointer-events: none;
      z-index: 2;
    }
    .deco-bottom-left-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 80px;
      height: 18px;
      background: #1e2d4a;
    }
    .deco-bottom-left-sq {
      position: absolute;
      bottom: 18px;
      left: 8px;
      width: 28px;
      height: 28px;
      background: #7c3aed;
      opacity: 0.8;
    }
    .deco-bottom-right {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 80px;
      height: 60px;
      pointer-events: none;
      z-index: 2;
    }
    .deco-bottom-right-main {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 44px;
      height: 44px;
      background: #7c3aed;
      opacity: 0.75;
    }
    .deco-bottom-right-sm {
      position: absolute;
      bottom: 44px;
      right: 44px;
      width: 20px;
      height: 20px;
      background: #c4b5fd;
      opacity: 0.7;
    }
    .deco-bottom-right-xs {
      position: absolute;
      bottom: 44px;
      right: 22px;
      width: 20px;
      height: 20px;
      background: #ddd6fe;
      opacity: 0.5;
    }

    /* ── Body ── */
    .cv-body {
      position: relative;
      display: flex;
      background: #ede9fe;
    }
    .cv-left {
      width: 340px;
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

    <!-- ══ HEADER ══ -->
    <div class="cv-header">

      <!-- Deco: top-left navy triangle + accent -->
      <div class="deco-top-left">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon points="0,0 60,0 0,60" fill="#1e2d4a"/>
        </svg>
        <div class="deco-top-left-accent"></div>
      </div>

      <!-- Deco: top-right purple bars -->
      <div class="deco-top-right">
        <div class="deco-top-right-back"></div>
        <div class="deco-top-right-front"></div>
        <div class="deco-top-right-accent"></div>
      </div>

      <div class="header-inner">
        <!-- Photo -->
        <div class="photo-wrap">
          ${photoHtml}
        </div>

        <!-- Name + Title -->
        <div class="name-block">
          ${data.name ? `<h1 class="cv-name">${data.name}</h1>` : ""}
          ${data.title ? `<p class="cv-title">${data.title}</p>` : ""}
        </div>
      </div>

      <div class="header-divider"></div>
    </div>

    <!-- ══ BODY ══ -->
    <div class="cv-body">

      <!-- Deco: bottom-left -->
      <div class="deco-bottom-left">
        <div class="deco-bottom-left-bar"></div>
        <div class="deco-bottom-left-sq"></div>
      </div>

      <!-- Deco: bottom-right -->
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
        ${certificationsHtml}
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