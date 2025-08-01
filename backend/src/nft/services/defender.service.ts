import { Injectable } from '@nestjs/common';
import { Defender } from '@openzeppelin/defender-sdk';

export interface MintNFTRequest {
  to: string;
  tokenURI: string;
  price: string;
}

export interface TransferNFTRequest {
  to: string;
  tokenId: string;
  from: string;
}

@Injectable()
export class DefenderService {
  private defender: Defender;

  constructor() {
    this.defender = new Defender({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });
  }

  /**
   * Mint NFT using OpenZeppelin Defender Autotask
   */
  async mintNFT(request: MintNFTRequest): Promise<any> {
    try {
      // Call Defender Autotask webhook for minting
      const webhookUrl = process.env.DEFENDER_MINT_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Defender mint webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NFT-Marketplace-Backend/1.0',
        },
        body: JSON.stringify({
          action: 'mint',
          to: request.to,
          tokenURI: request.tokenURI,
          price: request.price,
        }),
      });

      if (!response.ok) {
        throw new Error(`Defender API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error minting NFT via Defender:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  /**
   * Transfer NFT using OpenZeppelin Defender Autotask
   */
  async transferNFT(request: TransferNFTRequest): Promise<any> {
    try {
      // Call Defender Autotask webhook for transfer
      const webhookUrl = process.env.DEFENDER_TRANSFER_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Defender transfer webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transfer',
          to: request.to,
          tokenId: request.tokenId,
          from: request.from,
        }),
      });

      if (!response.ok) {
        throw new Error(`Defender API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error transferring NFT via Defender:', error);
      throw new Error('Failed to transfer NFT');
    }
  }

  /**
   * Get NFT details using Defender
   */
  async getNFTDetails(tokenId: string): Promise<any> {
    try {
      const webhookUrl = process.env.DEFENDER_QUERY_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Defender query webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getNFT',
          tokenId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Defender API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting NFT details via Defender:', error);
      throw new Error('Failed to get NFT details');
    }
  }

  /**
   * Get NFTs owned by address using Defender
   */
  async getNFTsByOwner(ownerAddress: string): Promise<any> {
    try {
      const webhookUrl = process.env.DEFENDER_QUERY_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Defender query webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getNFTsByOwner',
          ownerAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Defender API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting NFTs by owner via Defender:', error);
      throw new Error('Failed to get NFTs by owner');
    }
  }

  /**
   * Create Relayer for transaction signing
   */
  async createRelayer(name: string, network: string): Promise<any> {
    try {
      const relayer = await this.defender.relay.create({
        name,
        network,
        minBalance: '100000000000000000', // 0.1 ETH in wei as string
      });

      return relayer;
    } catch (error) {
      console.error('Error creating relayer:', error);
      throw new Error('Failed to create relayer');
    }
  }

  /**
   * Get relayer information
   */
  async getRelayer(relayerId: string): Promise<any> {
    try {
      const relayer = await this.defender.relay.get(relayerId);
      return relayer;
    } catch (error) {
      console.error('Error getting relayer:', error);
      throw new Error('Failed to get relayer');
    }
  }
}
