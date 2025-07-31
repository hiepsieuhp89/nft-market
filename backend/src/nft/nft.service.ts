import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DefenderService } from './services/defender.service';
import { WalletService } from '../wallet/wallet.service';
import { MintNFTDto } from './dto/mint-nft.dto';
import { TransferNFTDto } from './dto/transfer-nft.dto';

@Injectable()
export class NftService {
  constructor(
    private defenderService: DefenderService,
    private walletService: WalletService,
  ) {}

  /**
   * Mint NFT for user
   */
  async mintNFT(userId: string, mintDto: MintNFTDto) {
    try {
      // Get user wallet
      const wallet = await this.walletService.getWallet(userId);
      if (!wallet) {
        throw new Error('User wallet not found');
      }

      // Create metadata
      const metadata = {
        name: mintDto.name,
        description: mintDto.description,
        image: mintDto.imageUrl,
        attributes: [
          {
            trait_type: 'Creator',
            value: userId,
          },
          {
            trait_type: 'Created At',
            value: new Date().toISOString(),
          },
        ],
      };

      // Upload metadata to IPFS (you can implement this or use a service)
      const tokenURI = await this.uploadMetadataToIPFS(metadata);

      // Mint NFT using Defender
      const mintResult = await this.defenderService.mintNFT({
        to: wallet.address,
        tokenURI,
        price: mintDto.price.toString(),
      });

      // Save NFT data to Firestore
      const nftData = {
        userId,
        name: mintDto.name,
        description: mintDto.description,
        imageUrl: mintDto.imageUrl,
        price: mintDto.price,
        walletAddress: wallet.address,
        tokenId: mintResult.tokenId,
        tokenURI,
        transactionHash: mintResult.transactionHash,
        blockNumber: mintResult.blockNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isTransferred: false,
      };

      const docRef = await admin.firestore()
        .collection('nfts')
        .add(nftData);

      // Save transaction history
      await this.saveTransaction({
        userId,
        walletAddress: wallet.address,
        type: 'mint',
        tokenId: mintResult.tokenId,
        nftName: mintDto.name,
        transactionHash: mintResult.transactionHash,
        blockNumber: mintResult.blockNumber,
        status: 'confirmed',
      });

      return {
        id: docRef.id,
        ...mintResult,
        metadata,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }

  /**
   * Transfer NFT
   */
  async transferNFT(userId: string, transferDto: TransferNFTDto) {
    try {
      // Get user wallet
      const wallet = await this.walletService.getWallet(userId);
      if (!wallet) {
        throw new Error('User wallet not found');
      }

      // Verify user owns the NFT
      const nftDoc = await admin.firestore()
        .collection('nfts')
        .where('tokenId', '==', transferDto.tokenId)
        .where('userId', '==', userId)
        .where('isTransferred', '==', false)
        .limit(1)
        .get();

      if (nftDoc.empty) {
        throw new Error('NFT not found or already transferred');
      }

      // Transfer NFT using Defender
      const transferResult = await this.defenderService.transferNFT({
        from: wallet.address,
        to: transferDto.to,
        tokenId: transferDto.tokenId,
      });

      // Update NFT status in Firestore
      const nftDocRef = nftDoc.docs[0].ref;
      await nftDocRef.update({
        isTransferred: true,
        transferredTo: transferDto.to,
        transferredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Save transaction history
      await this.saveTransaction({
        userId,
        walletAddress: wallet.address,
        type: 'transfer',
        tokenId: transferDto.tokenId,
        nftName: nftDoc.docs[0].data().name,
        transactionHash: transferResult.transactionHash,
        blockNumber: transferResult.blockNumber,
        status: 'confirmed',
        recipientAddress: transferDto.to,
      });

      return transferResult;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw new Error(`Failed to transfer NFT: ${error.message}`);
    }
  }

  /**
   * Get NFTs owned by user
   */
  async getUserNFTs(userId: string) {
    try {
      const nftsSnapshot = await admin.firestore()
        .collection('nfts')
        .where('userId', '==', userId)
        .where('isTransferred', '==', false)
        .orderBy('createdAt', 'desc')
        .get();

      const nfts = nftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return nfts;
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      throw new Error('Failed to get user NFTs');
    }
  }

  /**
   * Get NFT details
   */
  async getNFTDetails(tokenId: string) {
    try {
      // Get from Firestore first
      const nftSnapshot = await admin.firestore()
        .collection('nfts')
        .where('tokenId', '==', tokenId)
        .limit(1)
        .get();

      if (!nftSnapshot.empty) {
        return {
          id: nftSnapshot.docs[0].id,
          ...nftSnapshot.docs[0].data(),
        };
      }

      // If not found in Firestore, get from blockchain via Defender
      const blockchainData = await this.defenderService.getNFTDetails(tokenId);
      return blockchainData;
    } catch (error) {
      console.error('Error getting NFT details:', error);
      throw new Error('Failed to get NFT details');
    }
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(userId: string) {
    try {
      const transactionsSnapshot = await admin.firestore()
        .collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  /**
   * Upload metadata to IPFS
   * This is a placeholder - implement with your preferred IPFS service
   */
  private async uploadMetadataToIPFS(metadata: any): Promise<string> {
    // For now, return a data URL as fallback
    // In production, implement proper IPFS upload
    const metadataString = JSON.stringify(metadata);
    const base64Data = Buffer.from(metadataString).toString('base64');
    return `data:application/json;base64,${base64Data}`;
  }

  /**
   * Save transaction to Firestore
   */
  private async saveTransaction(transactionData: any) {
    try {
      await admin.firestore()
        .collection('transactions')
        .add({
          ...transactionData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }
}
