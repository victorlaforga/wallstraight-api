// netlify/functions/auth-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    console.log('Auth Proxy invoked');
    console.log('Request body:', event.body);
    
    const { client_id, client_secret } = JSON.parse(event.body);

    // Maak een POST request naar de PrintAPI OAuth endpoint
    const response = await fetch('https://api.printapi.nl/v2/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*", // Of specifiek voor jouw GitHub Pages URL
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};