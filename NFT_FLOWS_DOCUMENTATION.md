# NFT Marketplace - Flows và Cấu hình

## Tổng quan về các luồng NFT

### 1. Luồng tạo NFT (Create NFT Flow)

**Frontend Components:**
- `components/create-nft-form.tsx` - Form tạo NFT
- `components/image-validator.tsx` - Validate hình ảnh

**Backend Services:**
- `lib/nft-service.ts::createNFT()` - Service chính
- `lib/blockchain-service.ts::mintNFT()` - Mint trên blockchain
- `lib/blockchain-service.ts::uploadToIPFS()` - Upload metadata lên IPFS

**Smart Contract:**
- `contracts/NFTMarketplace.sol::mintNFT()` - Function mint NFT

**Luồng xử lý:**
1. User nhập thông tin NFT (tên, giá, mô tả, hình ảnh)
2. Validate dữ liệu đầu vào
3. Kiểm tra network connection
4. Upload metadata lên IPFS
5. Gọi smart contract để mint NFT
6. Lưu thông tin vào Firestore
7. Lưu transaction history
8. Trả về kết quả cho user

### 2. Luồng chuyển NFT (Transfer NFT Flow)

**Frontend Components:**
- `components/transfer-nft.tsx` - Form chuyển NFT

**Backend Services:**
- `lib/nft-service.ts::transferNFT()` - Service chính
- `lib/blockchain-service.ts::transferNFT()` - Transfer trên blockchain

**Smart Contract:**
- `contracts/NFTMarketplace.sol::transferNFT()` - Function transfer NFT

**Luồng xử lý:**
1. User chọn NFT và nhập địa chỉ người nhận
2. Validate địa chỉ người nhận
3. Kiểm tra ownership của NFT
4. Gọi smart contract để transfer
5. Cập nhật thông tin ownership trong Firestore
6. Lưu transaction history
7. Trả về kết quả cho user

### 3. Luồng hiển thị NFT (List NFT Flow)

**Frontend Components:**
- `components/nft-gallery.tsx` - Hiển thị danh sách NFT
- `components/nft-stats.tsx` - Thống kê NFT

**Backend Services:**
- `lib/nft-service.ts::getNFTsByUser()` - Lấy NFT của user
- `lib/blockchain-service.ts::getNFTsByOwner()` - Lấy NFT từ blockchain (fallback)
- `lib/moralis-service.ts::getNFTsByWallet()` - Lấy NFT từ Moralis (primary)
- `lib/analytics-service.ts::getGlobalAnalytics()` - Thống kê và analytics

**Luồng xử lý:**
1. Lấy danh sách NFT từ Firestore
2. Merge với dữ liệu từ blockchain
3. Hiển thị thông tin NFT
4. Cập nhật real-time nếu có thay đổi

## Cấu hình Environment Variables

### Blockchain Configuration
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_NETWORK_NAME=Polygon Amoy
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/
NEXT_PUBLIC_BLOCK_EXPLORER=https://amoy.polygonscan.com/
```

### IPFS Configuration (Pinata)
```env
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key_here
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### Moralis v2 Configuration
```env
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_api_key_here
# Note: Moralis v2 only requires API key, no server URL needed
```

### Analytics Configuration
```env
# The Graph is disabled - using Moralis for analytics
# NEXT_PUBLIC_GRAPH_API_URL=https://api.thegraph.com/subgraphs/name/your_subgraph_name
```

## Hướng dẫn setup từng service

### 1. Setup Pinata (IPFS)
1. Đăng ký tài khoản tại https://pinata.cloud/
2. Tạo API Key và Secret Key
3. Hoặc tạo JWT token (khuyến nghị)
4. Cập nhật vào file .env

### 2. Setup Firebase
1. Tạo project tại https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Authentication (nếu cần)
4. Lấy config từ Project Settings
5. Cập nhật vào file .env

### 3. Setup Moralis v2
1. Đăng ký tại https://moralis.io/
2. Tạo project mới trong dashboard
3. Lấy API Key từ project settings
4. Cập nhật vào file .env (chỉ cần API key)
5. Test connection: `npm run test:moralis`

### 4. Analytics và Real-time Data
**The Graph đã được thay thế bằng Moralis**
- Moralis cung cấp đầy đủ tính năng analytics
- Real-time events thông qua polling
- Không cần deploy subgraph riêng

## Lưu ý quan trọng

1. **Security**: Không commit file .env vào git
2. **Environment**: Sử dụng các giá trị khác nhau cho dev/staging/production
3. **Fallback**: Các service đều có fallback khi không có config
4. **Error Handling**: Tất cả functions đều có error handling
5. **Type Safety**: Đã thêm type declarations cho TypeScript

## Troubleshooting

### Lỗi thường gặp:
1. **MetaMask not found**: User chưa cài MetaMask
2. **Wrong network**: User chưa switch sang đúng network
3. **IPFS upload failed**: Sai config Pinata hoặc hết quota
4. **Transaction failed**: Không đủ gas hoặc lỗi smart contract
5. **Firebase error**: Sai config hoặc chưa setup rules

### Debug tips:
1. Check browser console cho errors
2. Check network tab cho API calls
3. Verify environment variables
4. Test từng service riêng biệt
