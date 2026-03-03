export const GigTemplates = {
    applyGig: (name: string) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations!</title>
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

        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }

        .content h2 {
            color: #0f2b5a;
        }

        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            Congratulations!
        </div>
        <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your job application has been submitted successfully.</p>
        </div>
        <div class="footer">
            &copy; 2026 Skillquix. All rights reserved.
        </div>
    </div>
</body>

</html>`
}