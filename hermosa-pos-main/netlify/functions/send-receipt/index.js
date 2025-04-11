const fetch = require('node-fetch');

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    const { email, receiptHtml, subject } = JSON.parse(event.body);

    if (!email || !receiptHtml) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Email and receipt content are required" 
        })
      };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: "Hermosa POS",
          email: process.env.SMTP_FROM || "hello@hermosa-cbd.com"
        },
        to: [{
          email: email,
          name: email.split('@')[0]
        }],
        subject: subject || "Your Receipt from Hermosa POS",
        htmlContent: receiptHtml
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API error:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Failed to send email",
          details: data.message || "Unknown error"
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
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: "Internal server error",
        details: error.message
      })
    };
  }
};