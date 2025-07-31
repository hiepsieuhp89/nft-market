# NFT Marketplace - New Architecture Setup Guide

## Tổng quan thay đổi

### Kiến trúc cũ:
```
Frontend → MetaMask → Smart Contract
```

### Kiến trúc mới:
```
Frontend → Backend API → OpenZeppelin Defender → Smart Contract
```

## Những thay đổi chính

### 1. Authentication Flow
- **Cũ**: User đăng nhập Firebase Auth + kết nối MetaMask riêng biệt
- **Mới**: User chỉ đăng ký/đăng nhập bằng username/password, backend tự động tạo wallet

### 2. NFT Operations
- **Cũ**: Frontend gọi trực tiếp Smart Contract qua ethers.js
- **Mới**: Frontend gọi Backend API → OpenZeppelin Defender → Smart Contract

### 3. Wallet Management
- **Cũ**: User quản lý wallet qua MetaMask
- **Mới**: Backend quản lý wallet tự động, user không cần MetaMask

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
pnpm install
```

#### Cấu hình Environment Variables

Copy và cập nhật file `.env`:

```bash
cp .env.example .env
```

Cập nhật các biến sau trong `backend/.env`:

```env
# JWT Configuration
JWT_SECRET="your_strong_jwt_secret_here"

# Firebase Configuration
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_API_KEY="your_firebase_api_key"

# OpenZeppelin Defender Configuration
DEFENDER_API_KEY="your_defender_api_key"
DEFENDER_API_SECRET="your_defender_api_secret"

# Blockchain Configuration
CONTRACT_ADDRESS="your_deployed_contract_address"
RPC_URL="https://rpc-amoy.polygon.technology/"

# Encryption Key for wallet private keys
ENCRYPTION_KEY="your_strong_encryption_key_here"
```

#### Setup OpenZeppelin Defender

1. Tạo tài khoản tại [OpenZeppelin Defender](https://defender.openzeppelin.com/)
2. Lấy API Key và Secret
3. Chạy script setup:

```bash
cd backend
pnpm run setup:defender
```

Script này sẽ:
- Tạo Relayer cho việc ký transactions
- Deploy các Autotasks (mint, transfer, query)
- Cập nhật environment variables

#### Chạy Backend

```bash
cd backend
pnpm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3001`
API Documentation: `http://localhost:3001/api/docs`

### 2. Frontend Setup

Cập nhật file `.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

Chạy frontend:

```bash
pnpm run dev
```

## Testing Flow

### 1. Test Authentication

1. Mở `http://localhost:3000`
2. Đăng ký tài khoản mới với email/password
3. Kiểm tra:
   - User được tạo thành công
   - Wallet address được tự động generate
   - JWT token được lưu
   - Dashboard hiển thị thông tin user và wallet

### 2. Test NFT Minting

1. Trong Dashboard, vào tab "Create NFT"
2. Điền thông tin NFT:
   - Name: "Test NFT"
   - Description: "Test description"
   - Image URL: "https://example.com/image.jpg"
   - Price: 0.1
3. Click "Create NFT"
4. Kiểm tra:
   - API call đến backend thành công
   - Backend gọi OpenZeppelin Defender
   - NFT được mint trên blockchain
   - Transaction history được cập nhật

### 3. Test NFT Transfer

1. Vào tab "My Assets"
2. Chọn NFT vừa tạo
3. Nhập địa chỉ người nhận
4. Click "Transfer"
5. Kiểm tra:
   - NFT được transfer thành công
   - Transaction history được cập nhật

## Troubleshooting

### Backend Issues

1. **Lỗi Firebase Connection**
   - Kiểm tra Firebase credentials
   - Đảm bảo Firebase project được cấu hình đúng

2. **Lỗi OpenZeppelin Defender**
   - Kiểm tra API Key và Secret
   - Đảm bảo Relayer có đủ MATIC
   - Kiểm tra Autotasks đã được deploy

3. **Lỗi Database**
   - Kiểm tra Firestore rules
   - Đảm bảo collections được tạo đúng

### Frontend Issues

1. **Lỗi API Connection**
   - Kiểm tra `NEXT_PUBLIC_API_URL`
   - Đảm bảo backend đang chạy

2. **Lỗi Authentication**
   - Clear localStorage
   - Kiểm tra JWT token

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin user

### Wallet
- `GET /api/wallet/info` - Thông tin wallet
- `GET /api/wallet/balance/:address` - Kiểm tra balance

### NFT
- `POST /api/nft/mint` - Mint NFT
- `POST /api/nft/transfer` - Transfer NFT
- `GET /api/nft/my-nfts` - NFTs của user
- `GET /api/nft/transactions` - Lịch sử transactions

## Next Steps

1. Deploy backend lên production server
2. Cấu hình OpenZeppelin Defender cho mainnet
3. Update frontend environment variables cho production
4. Test toàn bộ flow trên production environment
