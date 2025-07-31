// OpenZeppelin Defender Autotask for Querying NFT Data
// This code runs on Defender infrastructure

const { ethers } = require('ethers');

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "getTokensByOwner",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "tokenPrices",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "tokenCreators",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Main handler function
exports.handler = async function(event) {
  const { request } = event;
  
  try {
    // Parse request body
    const body = JSON.parse(request.body);
    const { action } = body;
    
    // Get provider
    const provider = new ethers.providers.JsonRpcProvider(event.secrets.RPC_URL);
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(
      event.secrets.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    if (action === 'getNFT') {
      const { tokenId } = body;
      
      if (!tokenId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing tokenId parameter' })
        };
      }

      // Get NFT details
      const [tokenURI, owner, price, creator] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.ownerOf(tokenId),
        contract.tokenPrices(tokenId),
        contract.tokenCreators(tokenId)
      ]);

      // Fetch metadata from URI
      let metadata = {};
      try {
        if (tokenURI.startsWith('data:')) {
          // Handle data URL
          const base64Data = tokenURI.split(',')[1];
          metadata = JSON.parse(Buffer.from(base64Data, 'base64').toString());
        } else {
          // Handle HTTP URL
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
        metadata = { name: 'Unknown', description: 'Metadata unavailable' };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          tokenId,
          tokenURI,
          owner,
          price: ethers.utils.formatEther(price),
          creator,
          metadata
        })
      };

    } else if (action === 'getNFTsByOwner') {
      const { ownerAddress } = body;
      
      if (!ownerAddress) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing ownerAddress parameter' })
        };
      }

      // Get token IDs owned by the address
      const tokenIds = await contract.getTokensByOwner(ownerAddress);
      
      // Get details for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const [tokenURI, price, creator] = await Promise.all([
              contract.tokenURI(tokenId),
              contract.tokenPrices(tokenId),
              contract.tokenCreators(tokenId)
            ]);

            // Fetch metadata
            let metadata = {};
            try {
              if (tokenURI.startsWith('data:')) {
                const base64Data = tokenURI.split(',')[1];
                metadata = JSON.parse(Buffer.from(base64Data, 'base64').toString());
              } else {
                const response = await fetch(tokenURI);
                metadata = await response.json();
              }
            } catch (error) {
              metadata = { name: 'Unknown', description: 'Metadata unavailable' };
            }

            return {
              tokenId: tokenId.toString(),
              tokenURI,
              owner: ownerAddress,
              price: ethers.utils.formatEther(price),
              creator,
              metadata
            };
          } catch (error) {
            console.error(`Error getting details for token ${tokenId}:`, error);
            return null;
          }
        })
      );

      // Filter out failed requests
      const validNFTs = nfts.filter(nft => nft !== null);

      return {
        statusCode: 200,
        body: JSON.stringify({
          owner: ownerAddress,
          nfts: validNFTs
        })
      };

    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }

  } catch (error) {
    console.error('Error querying NFT data:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to query NFT data',
        message: error.message
      })
    };
  }
};
