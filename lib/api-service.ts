// API service for backend communication with React Query
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  walletAddress: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  balanceInEth: string;
}

export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  walletAddress: string;
  transactionHash: string;
  blockNumber: number;
  createdAt: any;
  isTransferred: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  walletAddress: string;
  type: 'mint' | 'transfer';
  tokenId: string;
  nftName: string;
  transactionHash: string;
  blockNumber: number;
  status: 'confirmed' | 'failed';
  createdAt: any;
  recipientAddress?: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'An error occurred');
    }

    return data;
  }

  // Authentication endpoints
  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  // Wallet endpoints
  async getWalletInfo(): Promise<WalletInfo> {
    return this.request<WalletInfo>('/wallet/info');
  }

  async getWalletBalance(address: string): Promise<{ balance: string; balanceInEth: string }> {
    return this.request<{ balance: string; balanceInEth: string }>(`/wallet/balance/${address}`);
  }

  // NFT endpoints
  async mintNFT(data: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  }): Promise<any> {
    return this.request<any>('/nft/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transferNFT(tokenId: string, to: string): Promise<any> {
    return this.request<any>('/nft/transfer', {
      method: 'POST',
      body: JSON.stringify({ tokenId, to }),
    });
  }

  async getUserNFTs(): Promise<NFT[]> {
    return this.request<NFT[]>('/nft/my-nfts');
  }

  async getNFTDetails(tokenId: string): Promise<NFT> {
    return this.request<NFT>(`/nft/details/${tokenId}`);
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/nft/transactions');
  }
}

export const apiService = new ApiService();
export default apiService;
