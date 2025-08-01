// NFT endpoints for Netlify Functions
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
    const queryParams = event.queryStringParameters || {};

    if (method === 'POST') {
      // Mint NFT endpoint
      if (event.path.includes('/mint')) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'NFT minting initiated',
            transactionHash: '0xmock-transaction-hash',
            tokenId: Math.floor(Math.random() * 10000),
          }),
        };
      }

      // Upload metadata endpoint
      if (event.path.includes('/upload')) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'Metadata uploaded to IPFS',
            ipfsHash: 'QmMockIPFSHash123456789',
            metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMockIPFSHash123456789',
          }),
        };
      }
    }

    if (method === 'GET') {
      // Get user NFTs
      if (event.path.includes('/user')) {
        const userId = queryParams.userId || 'mock-user';
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            nfts: [
              {
                tokenId: 1,
                name: 'Mock NFT #1',
                description: 'A beautiful mock NFT',
                image: 'https://via.placeholder.com/300x300',
                owner: userId,
                contractAddress: process.env.CONTRACT_ADDRESS,
              },
              {
                tokenId: 2,
                name: 'Mock NFT #2',
                description: 'Another beautiful mock NFT',
                image: 'https://via.placeholder.com/300x300',
                owner: userId,
                contractAddress: process.env.CONTRACT_ADDRESS,
              },
            ],
          }),
        };
      }

      // Get NFT details
      if (event.path.includes('/details')) {
        const tokenId = queryParams.tokenId || '1';
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            nft: {
              tokenId: parseInt(tokenId),
              name: `Mock NFT #${tokenId}`,
              description: 'A beautiful mock NFT',
              image: 'https://via.placeholder.com/300x300',
              attributes: [
                { trait_type: 'Color', value: 'Blue' },
                { trait_type: 'Rarity', value: 'Common' },
              ],
              contractAddress: process.env.CONTRACT_ADDRESS,
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
        message: 'NFT endpoint not found',
      }),
    };

  } catch (error) {
    console.error('NFT function error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};
