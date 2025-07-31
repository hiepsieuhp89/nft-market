// API service for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
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
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.error || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async register(email: string, password: string, displayName?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Wallet endpoints
  async getWalletInfo() {
    return this.request('/wallet/info');
  }

  async getWalletBalance(address: string) {
    return this.request(`/wallet/balance/${address}`);
  }

  // NFT endpoints
  async mintNFT(data: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  }) {
    return this.request('/nft/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transferNFT(tokenId: string, to: string) {
    return this.request('/nft/transfer', {
      method: 'POST',
      body: JSON.stringify({ tokenId, to }),
    });
  }

  async getUserNFTs() {
    return this.request('/nft/my-nfts');
  }

  async getNFTDetails(tokenId: string) {
    return this.request(`/nft/details/${tokenId}`);
  }

  async getTransactionHistory() {
    return this.request('/nft/transactions');
  }
}

export const apiService = new ApiService();
export default apiService;
