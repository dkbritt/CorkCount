import { getMetricsData } from "../../server/routes/metrics.ts";

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
    const result = await getMetricsData();

    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(result),
      };
    }
  } catch (error) {
    console.error('Metrics error:', error);
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
