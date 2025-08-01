// Debug version of Autotask to understand the issue
exports.handler = async function(event) {
  try {
    console.log('🔍 DEBUG: Full event object:', JSON.stringify(event, null, 2));
    
    const { request } = event;
    console.log('🔍 DEBUG: Request object:', JSON.stringify(request, null, 2));
    
    if (request && request.body) {
      console.log('🔍 DEBUG: Request body type:', typeof request.body);
      console.log('🔍 DEBUG: Request body value:', request.body);
      
      // Try different parsing approaches
      let body;
      if (typeof request.body === 'string') {
        console.log('🔍 DEBUG: Body is string, parsing JSON...');
        body = JSON.parse(request.body);
      } else if (typeof request.body === 'object') {
        console.log('🔍 DEBUG: Body is already object');
        body = request.body;
      } else {
        console.log('🔍 DEBUG: Body is unknown type:', typeof request.body);
        body = request.body;
      }
      
      console.log('🔍 DEBUG: Parsed body:', JSON.stringify(body, null, 2));
      
      const { action, to, tokenURI, price } = body;
      console.log('🔍 DEBUG: Extracted values:', { action, to, tokenURI, price });
      
      // Check secrets
      console.log('🔍 DEBUG: Available secrets:', Object.keys(event.secrets || {}));
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          debug: {
            bodyType: typeof request.body,
            bodyValue: request.body,
            parsedBody: body,
            extractedValues: { action, to, tokenURI, price },
            secretsAvailable: Object.keys(event.secrets || {})
          }
        })
      };
      
    } else {
      console.log('🔍 DEBUG: No request or request.body found');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No request body found',
          debug: {
            hasRequest: !!request,
            requestKeys: request ? Object.keys(request) : []
          }
        })
      };
    }
    
  } catch (error) {
    console.error('🔍 DEBUG: Error in handler:', error);
    console.error('🔍 DEBUG: Error stack:', error.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Debug error',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
