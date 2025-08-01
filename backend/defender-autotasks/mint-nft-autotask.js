// OpenZeppelin Defender Autotask for Minting NFTs
// This code runs on Defender infrastructure

const { ethers } = require('ethers');

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "uri", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "mintNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Main handler function
exports.handler = async function(event) {
  const { request } = event;
  
  try {
    // Parse request body - handle both string and object
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { action, to, tokenURI, price } = body;
    
    if (action !== 'mint') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }

    // Validate inputs
    if (!to || !tokenURI || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get relayer provider and signer
    const provider = new ethers.providers.JsonRpcProvider(event.secrets.RPC_URL);
    const signer = new ethers.Wallet(event.secrets.RELAYER_PRIVATE_KEY, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(
      event.secrets.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    // Convert price to wei
    const priceInWei = ethers.utils.parseEther(price.toString());

    // Call mint function
    console.log(`Minting NFT for ${to} with URI ${tokenURI} and price ${price}`);

    const tx = await contract.mintNFT(to, tokenURI, priceInWei, {
      gasLimit: 500000, // Set appropriate gas limit
      maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'), // 50 gwei
      maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'), // 30 gwei tip
    });

    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Extract token ID from events
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === 'NFTMinted') {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // Skip logs that don't match our interface
      }
    }

    // If NFTMinted event not found, try Transfer event
    if (!tokenId) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === 'Transfer' && parsedLog.args.from === ethers.constants.AddressZero) {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch (e) {
          // Skip logs that don't match our interface
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tokenId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      })
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to mint NFT',
        message: error.message
      })
    };
  }
};
