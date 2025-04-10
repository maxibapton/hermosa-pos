import fetch from 'node-fetch';

interface SendEmailParams {
  email: string;
  name?: string;
  subject: string;
  html: string;
}

export default async function sendEmail({ email, name, subject, html }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('Missing BREVO_API_KEY environment variable');
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: {
        name: "Hermosa POS",
        email: process.env.SMTP_FROM || "hello@hermosa-cbd.com"
      },
      to: [{
        email,
        name: name || "Client"
      }],
      subject,
      htmlContent: html
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.message || 'Failed to send email'
    };
  }

  return {
    success: true,
    messageId: data.messageId
  };
}