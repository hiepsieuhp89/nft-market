// Main entry point for OpenZeppelin Defender Autotasks
const mintNFT = require('./mint-nft-autotask');
const transferNFT = require('./transfer-nft-autotask');
const queryNFT = require('./query-nft-autotask');

// Main handler function
exports.handler = async function(event) {
  const { action } = event.request.body;
  
  console.log('Received action:', action);
  
  try {
    switch (action) {
      case 'mint':
        return await mintNFT.handler(event);
      case 'transfer':
        return await transferNFT.handler(event);
      case 'getNFT':
      case 'getNFTsByOwner':
        return await queryNFT.handler(event);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in autotask:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
};
