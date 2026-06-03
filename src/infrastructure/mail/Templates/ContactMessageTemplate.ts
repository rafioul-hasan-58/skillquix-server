export const ContactMessageTemplates = {
  supportEmail: (data: {
    name: string;
    email: string;
    phoneNumber?: string;
    organization?: string;
    message: string;
    messageCategory: string;
  }) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Support Message</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #0f2b5a;
            color: #ffffff;
            text-align: center;
            padding: 30px;
            font-size: 24px;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            background-color: #e8f0fe;
            color: #0f2b5a;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }

        .content h2 {
            color: #0f2b5a;
        }

        .field-label {
            font-size: 12px;
            color: #888888;
            margin: 0;
        }

        .field-value {
            font-size: 15px;
            color: #1a2b4a;
            font-weight: bold;
            margin: 4px 0 16px;
        }

        .message-box {
            background-color: #f9f9f9;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid #0f2b5a;
            font-size: 15px;
            color: #333;
            line-height: 1.6;
        }

        .divider {
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 16px 0;
        }

        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777777;
            background-color: #f9f9f9;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            New Support Message
        </div>
        <div class="content">
            <span class="badge">${data.messageCategory.replace(/_/g, " ")}</span>

            <hr class="divider" />

            <p class="field-label">Full Name</p>
            <p class="field-value">${data.name}</p>

            <p class="field-label">Email</p>
            <p class="field-value">${data.email}</p>

            <p class="field-label">Phone Number</p>
            <p class="field-value">${data.phoneNumber ?? "N/A"}</p>

            <p class="field-label">Organization</p>
            <p class="field-value">${data.organization ?? "N/A"}</p>

            <p class="field-label">Message</p>
            <div class="message-box">${data.message}</div>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Skillquix. All rights reserved.
        </div>
    </div>
</body>

</html>`,
  sendFeedBack: (data: {
    name: string;
    email: string;
    question: string;
    formattedDate: string;
    formattedTime: string;
    message: string;
  }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Feedback Received</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f0;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a;border-radius:12px 12px 0 0;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888888;">Your App Name</p>
                    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#ffffff;">New feedback received</h1>
                  </td>
                  <td align="right" valign="middle">
                    <div style="width:44px;height:44px;background-color:#2a2a2a;border-radius:50%;text-align:center;line-height:44px;font-size:20px;">💬</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">

              <!-- Meta row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-family:Arial,sans-serif;">From</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-family:Arial,sans-serif;font-weight:600;">${data.name}</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#666666;font-family:Arial,sans-serif;">${data.email}</p>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-family:Arial,sans-serif;font-weight:600;">${data.formattedDate}</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#666666;font-family:Arial,sans-serif;">${data.formattedTime}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 28px;" />

              <!-- Question -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-family:Arial,sans-serif;">Question</p>
              <div style="background-color:#f4f4f0;border-left:3px solid #cccccc;border-radius:0 8px 8px 0;padding:16px 24px;margin-bottom:28px;">
                <p style="margin:0;font-size:15px;line-height:1.8;color:#444444;font-family:Georgia,serif;">${data.question}</p>
              </div>

              <!-- Message -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#999999;font-family:Arial,sans-serif;">Message</p>
              <div style="background-color:#f9f9f7;border-left:3px solid #1a1a1a;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
                <p style="margin:0;font-size:15px;line-height:1.8;color:#1a1a1a;font-family:Georgia,serif;">${data.message}</p>
              </div>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#aaaaaa;font-family:Arial,sans-serif;text-align:center;">
                This message was sent via the feedback form in your app.
              </p>

            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style="background-color:#f0f0ec;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaaaaa;font-family:Arial,sans-serif;letter-spacing:0.5px;">
                © 2026 Skillquix &nbsp;·&nbsp; You are receiving this as an admin notification.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
};