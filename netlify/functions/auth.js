import { handleAdminLogin } from "../../server/routes/auth.js";

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/auth', '');
    const body = event.body ? JSON.parse(event.body) : {};

    // POST /auth/login
    if (path === '/login') {
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Email and password are required",
          }),
        };
      }

      const result = await handleAdminLogin(email, password);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Auth endpoint not found' 
      }),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
    };
  }
};
