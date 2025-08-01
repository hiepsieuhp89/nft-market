# AWS + Netlify Setup Guide - Giải quyết 4KB Environment Variables Limit

## Tổng quan
Hướng dẫn này sẽ giúp bạn sử dụng AWS Parameter Store để lưu trữ environment variables, tránh giới hạn 4KB của AWS Lambda trên Netlify.

## Bước 1: Tạo AWS Access Keys

### 1.1 Đăng nhập AWS Console
1. Truy cập [AWS Console](https://console.aws.amazon.com/)
2. Đăng nhập với tài khoản AWS của bạn

### 1.2 Tạo IAM User
1. Tìm kiếm "IAM" trong AWS Console
2. Vào **IAM** → **Users** → **Create user**
3. Đặt tên user: `netlify-functions-user`
4. Chọn **Programmatic access**

### 1.3 Gán Permissions
Tạo custom policy với permissions tối thiểu:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath",
                "ssm:PutParameter"
            ],
            "Resource": "arn:aws:ssm:*:*:parameter/netlify/*"
        }
    ]
}
```

### 1.4 Lấy Access Keys
1. Hoàn thành tạo user
2. **Lưu lại Access Key ID và Secret Access Key** (chỉ hiển thị 1 lần)

## Bước 2: Setup AWS Parameter Store

### 2.1 Cài đặt dependencies
```bash
cd backend
pnpm install @aws-sdk/client-ssm
```

### 2.2 Tạo file .env với AWS credentials
```bash
# backend/.env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1

# Thêm tất cả environment variables hiện tại
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
DEFENDER_API_SECRET=your_defender_secret
PINATA_JWT=your_pinata_jwt
MORALIS_API_KEY=your_moralis_key
PRIVATE_KEY=your_private_key
ENCRYPTION_KEY=your_encryption_key
# ... các variables khác
```

### 2.3 Chạy setup script
```bash
cd backend
node scripts/setup-aws-parameters.js
```

Script này sẽ:
- Đọc tất cả environment variables từ .env
- Upload chúng lên AWS Parameter Store với prefix `/netlify/`
- Sử dụng SecureString cho sensitive data

## Bước 3: Cấu hình Netlify

### 3.1 Set AWS credentials trong Netlify Dashboard
1. Vào Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Thêm 2 variables:
   - `AWS_ACCESS_KEY_ID`: your_access_key_id
   - `AWS_SECRET_ACCESS_KEY`: your_secret_access_key

### 3.2 Xóa tất cả environment variables khác
- Xóa tất cả variables khác trong Netlify dashboard
- Chỉ giữ lại AWS credentials

## Bước 4: Deploy và Test

### 4.1 Deploy
```bash
git add .
git commit -m "Add AWS Parameter Store integration"
git push
```

### 4.2 Test functions
Sau khi deploy thành công:
- Functions sẽ tự động load configuration từ AWS Parameter Store
- Kiểm tra logs để đảm bảo không có lỗi

## Cách hoạt động

### 1. Function Initialization
```typescript
export const handler: Handler = async (event, context) => {
  // Load configuration từ AWS Parameter Store
  await initializeConfig();
  
  // Bây giờ có thể sử dụng process.env như bình thường
  const firebaseKey = process.env.FIREBASE_PRIVATE_KEY;
  // ...
};
```

### 2. Caching
- Configuration được cache trong 5 phút
- Giảm số lần gọi AWS API
- Tăng performance

### 3. Security
- Sensitive data được mã hóa trong AWS Parameter Store
- Chỉ functions có quyền truy cập
- AWS credentials được bảo mật trong Netlify

## Lợi ích

✅ **Giải quyết 4KB limit**: Environment variables không còn bị giới hạn  
✅ **Bảo mật cao**: Sensitive data được mã hóa trong AWS  
✅ **Dễ quản lý**: Centralized configuration management  
✅ **Performance**: Caching giảm latency  
✅ **Scalable**: Có thể mở rộng cho nhiều environments  

## Troubleshooting

### Lỗi AWS credentials
```
Error: The security token included in the request is invalid
```
**Giải pháp**: Kiểm tra AWS_ACCESS_KEY_ID và AWS_SECRET_ACCESS_KEY trong Netlify dashboard

### Lỗi permissions
```
Error: User is not authorized to perform: ssm:GetParameter
```
**Giải pháp**: Kiểm tra IAM policy có đúng permissions không

### Function timeout
```
Error: Task timed out after 10.00 seconds
```
**Giải pháp**: AWS Parameter Store có thể chậm, tăng timeout hoặc optimize caching

## Chi phí AWS

- AWS Parameter Store: $0.05 per 10,000 requests
- Với caching 5 phút, chi phí rất thấp
- Estimate: < $1/tháng cho most use cases
