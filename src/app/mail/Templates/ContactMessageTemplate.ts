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

</html>`
};