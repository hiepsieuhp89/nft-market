// React Query hooks for API calls
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, type User, type AuthResponse, type WalletInfo, type NFT, type Transaction } from '@/lib/api-service';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const queryKeys = {
  profile: ['profile'],
  walletInfo: ['wallet', 'info'],
  walletBalance: (address: string) => ['wallet', 'balance', address],
  userNFTs: ['nft', 'user'],
  nftDetails: (tokenId: string) => ['nft', 'details', tokenId],
  transactions: ['transactions'],
} as const;

// Auth Hooks
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password, displayName }: { 
      email: string; 
      password: string; 
      displayName?: string; 
    }) => apiService.register(email, password, displayName),
    onSuccess: (data: AuthResponse) => {
      apiService.setToken(data.accessToken);
      queryClient.setQueryData(queryKeys.profile, data.user);
      toast({
        title: "Đăng ký thành công!",
        description: `Chào mừng ${data.user.displayName}! Wallet của bạn: ${data.user.walletAddress.slice(0, 6)}...${data.user.walletAddress.slice(-4)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      apiService.login(email, password),
    onSuccess: (data: AuthResponse) => {
      apiService.setToken(data.accessToken);
      queryClient.setQueryData(queryKeys.profile, data.user);
      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng bạn quay trở lại, ${data.user.displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đăng nhập",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      apiService.clearToken();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiService.getProfile(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Wallet Hooks
export function useWalletInfo() {
  return useQuery({
    queryKey: queryKeys.walletInfo,
    queryFn: () => apiService.getWalletInfo(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useWalletBalance(address: string) {
  return useQuery({
    queryKey: queryKeys.walletBalance(address),
    queryFn: () => apiService.getWalletBalance(address),
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// NFT Hooks
export function useMintNFT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      imageUrl: string;
      price: number;
    }) => apiService.mintNFT(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userNFTs });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInfo });
      toast({
        title: "NFT đã được tạo thành công!",
        description: "NFT của bạn đã được mint trên blockchain.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi tạo NFT",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTransferNFT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tokenId, to }: { tokenId: string; to: string }) => 
      apiService.transferNFT(tokenId, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userNFTs });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      toast({
        title: "Chuyển NFT thành công!",
        description: "NFT đã được chuyển đến địa chỉ người nhận.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi chuyển NFT",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUserNFTs() {
  return useQuery({
    queryKey: queryKeys.userNFTs,
    queryFn: () => apiService.getUserNFTs(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useNFTDetails(tokenId: string) {
  return useQuery({
    queryKey: queryKeys.nftDetails(tokenId),
    queryFn: () => apiService.getNFTDetails(tokenId),
    enabled: !!tokenId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTransactionHistory() {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: () => apiService.getTransactionHistory(),
    staleTime: 30 * 1000, // 30 seconds
  });
}
