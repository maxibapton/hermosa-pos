const fetch = require('node-fetch');

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    const { email, subject, receiptHtml } = JSON.parse(event.body || '{}');

    if (!email || !subject || !receiptHtml) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        })
      };
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SMTP_FROM || 'hello@hermosa-cbd.com';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          email: senderEmail, 
          name: 'CBD Wellness' 
        },
        to: [{ 
          email,
          name: email.split('@')[0]
        }],
        subject,
        htmlContent: receiptHtml
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send email',
          details: data.message || 'Unknown error'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: data.messageId
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};