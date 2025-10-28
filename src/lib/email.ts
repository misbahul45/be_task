  export function generateVerificationTemplate(name: string, url: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Moodys Email Verification</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            padding: 32px;
          }
          .container {
            max-width: 480px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 16px;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: #334155;
          }
          a.button {
            display: inline-block;
            margin-top: 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          }
          a.button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 32px;
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Moodys, ${name}!</h1>
          <p>
            Thanks for signing up for <strong>Moodys</strong> — your personal mood tracking and emotional insight companion.
          </p>
          <p>
            Please verify your email address to activate your account:
          </p>
          <a class="button" href="${url}" target="_blank">Verify My Email</a>
          <p class="footer">
            If you didn’t create a Moodys account, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }