// netlify/functions/order-proxy.js
const fetch = require('node-fetch');

// netlify/functions/order-proxy.js
exports.handler = async function(event, context) {
  // Handle OPTIONS method voor CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    console.log('Order Proxy invoked');
    console.log('Request body:', event.body);
    
    const { orderData, token } = JSON.parse(event.body);
    console.log('Order data received:', JSON.stringify(orderData));

    // Maak een POST request naar de PrintAPI order endpoint
    const response = await fetch('https://live.printapi.nl/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*", // Of specifiek voor jouw GitHub Pages URL
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log('Error in order-proxy:', error);
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