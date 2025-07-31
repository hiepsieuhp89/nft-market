import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as admin from 'firebase-admin';

export interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

@Injectable()
export class WalletService {
  /**
   * Generate a new Ethereum wallet
   */
  async generateWallet(): Promise<WalletData> {
    // Create a random wallet
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    };
  }

  /**
   * Save wallet data securely to Firebase
   * Private keys are encrypted before storage
   */
  async saveWallet(userId: string, walletData: WalletData): Promise<void> {
    try {
      // Encrypt private key before storing
      const encryptedPrivateKey = this.encryptPrivateKey(walletData.privateKey);
      
      const walletDoc = {
        userId,
        address: walletData.address,
        encryptedPrivateKey,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store in a separate secure collection
      await admin.firestore()
        .collection('wallets')
        .doc(userId)
        .set(walletDoc);

    } catch (error) {
      console.error('Error saving wallet:', error);
      throw new Error('Failed to save wallet data');
    }
  }

  /**
   * Get wallet data for a user
   */
  async getWallet(userId: string): Promise<{ address: string } | null> {
    try {
      const walletDoc = await admin.firestore()
        .collection('wallets')
        .doc(userId)
        .get();

      if (!walletDoc.exists) {
        return null;
      }

      const walletData = walletDoc.data();
      return {
        address: walletData.address,
      };
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  /**
   * Get wallet with private key for transaction signing
   * This should only be used by backend services
   */
  async getWalletForSigning(userId: string): Promise<ethers.Wallet | null> {
    try {
      const walletDoc = await admin.firestore()
        .collection('wallets')
        .doc(userId)
        .get();

      if (!walletDoc.exists) {
        return null;
      }

      const walletData = walletDoc.data();
      const privateKey = this.decryptPrivateKey(walletData.encryptedPrivateKey);
      
      return new ethers.Wallet(privateKey);
    } catch (error) {
      console.error('Error getting wallet for signing:', error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<{ balance: string; balanceInEth: string }> {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const balance = await provider.getBalance(address);
      
      return {
        balance: balance.toString(),
        balanceInEth: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Simple encryption for private keys
   * In production, use proper encryption with KMS or similar
   */
  private encryptPrivateKey(privateKey: string): string {
    // This is a simple example - in production use proper encryption
    // Consider using AWS KMS, Azure Key Vault, or similar services
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    
    // Simple XOR encryption (NOT secure for production)
    let encrypted = '';
    for (let i = 0; i < privateKey.length; i++) {
      encrypted += String.fromCharCode(
        privateKey.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Simple decryption for private keys
   */
  private decryptPrivateKey(encryptedPrivateKey: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const encrypted = Buffer.from(encryptedPrivateKey, 'base64').toString();
    
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return decrypted;
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}
