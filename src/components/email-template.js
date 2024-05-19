// email-template.js
export function generateEmailTemplate(variables) {
  const {
    companyName,
    subject,
    toEmail,
    fromEmail,
    ctaLink,
    ctaMessage,
    content,
  } = variables;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        /* Add your company's branding styles here */
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: left;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 20px;
        }
        .cta-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #770BF4;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 20px;
        }
        .cta-button,
        .cta-button:link,
        .cta-button:visited,
        .cta-button:hover,
        .cta-button:active {
          color: #ffffff;
        }
        .footer {
          text-align: center;
          color: #888888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://phonescreen.ai">
            <img src="https://phonescreen.ai/small-logo.png" alt="${companyName}" width="100%" />
          </a>
        </div>
        <div class="content">
          <p>Dear ${toEmail},</p>
          ${content}
          ${
            ctaLink && ctaMessage
              ? `
            <a href="${ctaLink}" class="cta-button">${ctaMessage}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          This email was sent from ${fromEmail}
        </div>
      </div>
    </body>
    </html>
  `;
}
