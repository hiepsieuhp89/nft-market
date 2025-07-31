// OpenZeppelin Defender Autotask for Transferring NFTs
// This code runs on Defender infrastructure

const { ethers } = require('ethers');

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "transferNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
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
  }
];

// Main handler function
exports.handler = async function(event) {
  const { request } = event;
  
  try {
    // Parse request body
    const body = JSON.parse(request.body);
    const { action, to, tokenId, from } = body;
    
    if (action !== 'transfer') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }

    // Validate inputs
    if (!to || !tokenId || !from) {
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

    // Verify ownership
    const currentOwner = await contract.ownerOf(tokenId);
    if (currentOwner.toLowerCase() !== from.toLowerCase()) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Sender does not own this NFT' })
      };
    }

    // Call transfer function
    console.log(`Transferring NFT ${tokenId} from ${from} to ${to}`);
    
    const tx = await contract.transferNFT(to, tokenId, {
      gasLimit: 300000, // Set appropriate gas limit
    });

    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from,
        to,
        tokenId,
      })
    };

  } catch (error) {
    console.error('Error transferring NFT:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to transfer NFT',
        message: error.message
      })
    };
  }
};
