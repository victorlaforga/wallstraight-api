// netlify/functions/auth-proxy.js
// Opnieuw geschreven om er zeker van te zijn dat er geen cachingproblemen zijn
exports.handler = async function(event, context) {
  // CORS headers voor preflight requests
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
    console.log('Auth Proxy invoked - new version');
    console.log('Request body:', event.body);
    
    const { client_id, client_secret } = JSON.parse(event.body);
    const apiUrl = 'https://live.printapi.nl/v2/oauth';
    
    console.log('Making request to:', apiUrl);

    // Gebruik native fetch (Node.js 18+)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret
      })
    });

    // Log de status van de respons
    console.log('Response status:', response.status);

    // Controleer of response OK is
    if (!response.ok) {
      const textResponse = await response.text();
      console.log('Error response body:', textResponse);
      throw new Error(`API responded with status ${response.status}: ${textResponse}`);
    }

    const data = await response.json();
    console.log('Successful response received');

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log('Error in auth-proxy:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ 
        error: error.message,
        details: "Check if API URL is correct: should be https://api.printapi.nl/v2/oauth"
      })
    };
  }
};