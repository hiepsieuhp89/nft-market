// Auth endpoints for Netlify Functions
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    if (method === 'POST') {
      // Login endpoint
      if (event.path.includes('/login')) {
        // Mock login response
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'Login successful',
            user: {
              uid: 'mock-user-id',
              email: body.email || 'user@example.com',
            },
            token: 'mock-jwt-token',
          }),
        };
      }

      // Register endpoint
      if (event.path.includes('/register')) {
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'User registered successfully',
            user: {
              uid: 'new-user-id',
              email: body.email,
            },
          }),
        };
      }
    }

    if (method === 'GET') {
      // Profile endpoint
      if (event.path.includes('/profile')) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            user: {
              uid: 'mock-user-id',
              email: 'user@example.com',
              walletAddress: '0x1234567890123456789012345678901234567890',
            },
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Not Found',
        message: 'Auth endpoint not found',
      }),
    };

  } catch (error) {
    console.error('Auth function error:', error);

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
