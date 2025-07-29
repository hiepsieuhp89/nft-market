# NFT Marketplace - Real Blockchain Implementation

Ứng dụng NFT Marketplace hoàn chỉnh với smart contract thực tế trên mạng Polygon.

## 🚀 Tính năng

### ✅ Đã hoàn thành
- **Authentication**: Firebase Auth với đăng nhập/đăng ký
- **Wallet Integration**: Kết nối MetaMask với Polygon network
- **Smart Contract**: ERC-721 contract thực tế trên Polygon
- **NFT Minting**: Tạo NFT với metadata lưu trên IPFS
- **NFT Transfer**: Chuyển NFT giữa các ví
- **Real-time Updates**: Hiển thị transaction hash, block number, gas used
- **Blockchain Explorer**: Link đến Polygonscan cho mọi transaction

### 🔧 Smart Contract Features
- **ERC-721 Standard**: Tuân thủ chuẩn NFT
- **Metadata Storage**: IPFS integration cho metadata
- **Price Tracking**: Lưu giá NFT on-chain
- **Creator Tracking**: Theo dõi người tạo NFT
- **Ownership Management**: Quản lý quyền sở hữu
- **Event Logging**: Log tất cả hoạt động on-chain

## 🛠 Cài đặt và Triển khai

### 1. Cài đặt Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Cấu hình Environment Variables
Copy file `.env.example` thành `.env.local` và cập nhật các giá trị Firebase:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Cập nhật các giá trị trong `.env.local`:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

### 3. Cấu hình Smart Contract
\`\`\`bash
# Compile contract
npm run compile

# Deploy to Polygon Mainnet
npm run deploy

# Deploy to Mumbai Testnet
npm run deploy:testnet
\`\`\`

### 4. Cập nhật Contract Address
Sau khi deploy, cập nhật địa chỉ contract trong `lib/contract-config.ts`:
\`\`\`typescript
export const CONTRACT_CONFIG = {
  address: "YOUR_DEPLOYED_CONTRACT_ADDRESS",
  // ...
}
\`\`\`

### 4. Cấu hình IPFS (Pinata)
Cập nhật API keys trong `lib/contract-config.ts`:
\`\`\`typescript
export const IPFS_CONFIG = {
  apiKey: "your_pinata_api_key",
  secretKey: "your_pinata_secret_key",
}
\`\`\`

### 5. Chạy ứng dụng
\`\`\`bash
npm run dev
\`\`\`

## 📋 Hướng dẫn sử dụng

### 1. Kết nối ví
- Cài đặt MetaMask extension
- Kết nối ví với ứng dụng
- Chuyển sang mạng Polygon

### 2. Tạo NFT
- Điền thông tin NFT (tên, giá, mô tả)
- Upload hình ảnh
- Xác nhận transaction trên MetaMask
- Chờ confirmation trên blockchain

### 3. Chuyển NFT
- Chọn NFT từ bộ sưu tập
- Nhập địa chỉ ví người nhận
- Xác nhận transaction
- Theo dõi trạng thái trên Polygonscan

## 🔗 Blockchain Integration

### Smart Contract Functions
- `mintNFT()`: Tạo NFT mới
- `transferNFT()`: Chuyển NFT
- `getTokensByOwner()`: Lấy danh sách NFT của owner
- `updatePrice()`: Cập nhật giá NFT

### Transaction Tracking
- Real-time transaction status
- Gas usage monitoring
- Block confirmation tracking
- Polygonscan integration

## 🌐 Network Configuration

### Polygon Mainnet
- Chain ID: 137
- RPC: https://polygon-rpc.com/
- Explorer: https://polygonscan.com/

### Mumbai Testnet
- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com/
- Explorer: https://mumbai.polygonscan.com/

## 📁 Cấu trúc Project

\`\`\`
├── contracts/
│   └── NFTMarketplace.sol      # Smart contract
├── scripts/
│   └── deploy-contract.js      # Deployment script
├── lib/
│   ├── blockchain-service.ts   # Blockchain interactions
│   ├── contract-config.ts      # Contract configuration
│   └── nft-service.ts         # NFT business logic
├── components/
│   ├── create-nft-form.tsx    # NFT creation form
│   ├── nft-gallery.tsx        # NFT display
│   └── transfer-nft.tsx       # NFT transfer
└── hardhat.config.js          # Hardhat configuration
\`\`\`

## 🔐 Security Features

- **Ownership Verification**: Chỉ owner mới có thể transfer NFT
- **Address Validation**: Kiểm tra địa chỉ Ethereum hợp lệ
- **Network Verification**: Đảm bảo kết nối đúng network
- **Transaction Confirmation**: Chờ block confirmation
- **Error Handling**: Xử lý lỗi blockchain comprehensive

## 🎯 Production Ready

Ứng dụng đã sẵn sàng cho production với:
- ✅ Real smart contract deployment
- ✅ IPFS metadata storage
- ✅ Comprehensive error handling
- ✅ Transaction monitoring
- ✅ Gas optimization
- ✅ Security best practices
