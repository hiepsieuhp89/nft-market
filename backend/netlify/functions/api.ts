// Simple Netlify Function for API endpoints
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;

    // Simple routing
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'ok',
          message: 'NFT Marketplace API is running',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    if (path === '/docs' && method === 'GET') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>NFT Marketplace API</title>
          </head>
          <body>
            <h1>NFT Marketplace API</h1>
            <p>API is running on Netlify Functions</p>
            <ul>
              <li><a href="/.netlify/functions/api/health">Health Check</a></li>
              <li><a href="/.netlify/functions/api/auth">Auth Endpoints</a></li>
              <li><a href="/.netlify/functions/api/nft">NFT Endpoints</a></li>
            </ul>
          </body>
          </html>
        `,
      };
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route ${method} ${path} not found`,
        availableRoutes: ['/health', '/docs'],
      }),
    };

  } catch (error) {
    console.error('Function error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
    };
  }
};
