# NFT Marketplace Backend

Backend API cho NFT Marketplace với tích hợp OpenZeppelin Defender.

## Tính năng

- 🔐 Authentication với JWT và Firebase
- 💰 Tự động tạo wallet cho user khi đăng ký
- 🎨 Mint NFT thông qua OpenZeppelin Defender
- 🔄 Transfer NFT an toàn
- 📊 Quản lý transaction history
- 🛡️ Bảo mật với Relayer và Autotasks

## Kiến trúc

```
Frontend → Backend API → OpenZeppelin Defender → Smart Contract
```

## Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd backend
pnpm install
```

### 2. Cấu hình environment variables

```bash
cp .env.example .env
```

Cập nhật các biến trong `.env`:

```env
# JWT Configuration
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"

# Firebase Configuration
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"

# OpenZeppelin Defender Configuration
DEFENDER_API_KEY="your_defender_api_key"
DEFENDER_API_SECRET="your_defender_api_secret"

# Blockchain Configuration
NETWORK_NAME="polygon-amoy"
RPC_URL="https://rpc-amoy.polygon.technology/"
CONTRACT_ADDRESS="your_contract_address"
CHAIN_ID="80002"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. Setup OpenZeppelin Defender

```bash
pnpm run setup:defender
```

Script này sẽ:
- Tạo Relayer cho việc ký transactions
- Deploy các Autotasks (mint, transfer, query)
- Cập nhật environment variables

### 4. Chạy server

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user

### Wallet

- `GET /api/wallet/info` - Thông tin wallet của user
- `GET /api/wallet/balance/:address` - Kiểm tra balance

### NFT

- `POST /api/nft/mint` - Mint NFT mới
- `POST /api/nft/transfer` - Transfer NFT
- `GET /api/nft/my-nfts` - Lấy NFTs của user
- `GET /api/nft/details/:tokenId` - Chi tiết NFT
- `GET /api/nft/transactions` - Lịch sử transactions

## OpenZeppelin Defender Setup

### 1. Tạo tài khoản Defender

1. Truy cập [OpenZeppelin Defender](https://defender.openzeppelin.com/)
2. Tạo tài khoản và project
3. Lấy API Key và Secret

### 2. Cấu hình Autotasks

Các Autotasks được tạo tự động bởi script `setup:defender`:

- **Mint Autotask**: Xử lý việc mint NFT
- **Transfer Autotask**: Xử lý việc transfer NFT  
- **Query Autotask**: Truy vấn thông tin NFT

### 3. Cấu hình Relayer

Relayer sẽ được tạo tự động và cần:
- Fund MATIC cho gas fees
- Cấu hình private key trong Autotask secrets

## Bảo mật

- Private keys được mã hóa trước khi lưu Firebase
- Sử dụng OpenZeppelin Defender Relayer cho transactions
- JWT authentication cho tất cả endpoints
- Validation đầy đủ cho inputs

## Development

```bash
# Chạy trong development mode
pnpm run start:dev

# Build
pnpm run build

# Lint
pnpm run lint

# Test
pnpm run test
```

## API Documentation

Sau khi chạy server, truy cập:
- Swagger UI: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/api/health`

## Troubleshooting

### Lỗi Defender Connection
- Kiểm tra API Key và Secret
- Đảm bảo Relayer có đủ MATIC
- Kiểm tra network configuration

### Lỗi Firebase
- Kiểm tra Firebase credentials
- Đảm bảo Firestore rules được cấu hình đúng

### Lỗi Smart Contract
- Kiểm tra contract address
- Đảm bảo contract đã được deploy
- Kiểm tra RPC URL
