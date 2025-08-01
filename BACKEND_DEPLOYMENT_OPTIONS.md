# Backend Deployment Options - Thay thế Netlify Functions

Do giới hạn 4KB environment variables của Netlify Functions, chúng ta cần deploy backend riêng biệt.

## Tùy chọn 1: Railway (Khuyến nghị) 🚀

### Ưu điểm:
- ✅ Miễn phí $5/tháng credit
- ✅ Hỗ trợ NestJS tự động
- ✅ Không giới hạn environment variables
- ✅ Deploy từ GitHub tự động
- ✅ Có database PostgreSQL miễn phí

### Cách deploy:
1. Truy cập [Railway.app](https://railway.app)
2. Đăng nhập với GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Chọn repository của bạn
5. Railway tự động detect NestJS và deploy
6. Set environment variables trong Railway dashboard
7. Lấy URL và cập nhật `NEXT_PUBLIC_API_URL`

### Cấu hình Railway:
```bash
# railway.json (tạo trong thư mục backend)
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health"
  }
}
```

## Tùy chọn 2: Vercel

### Ưu điểm:
- ✅ Miễn phí cho hobby projects
- ✅ Serverless functions
- ✅ Deploy từ GitHub tự động
- ✅ Tích hợp tốt với Next.js

### Cách deploy:
1. Truy cập [Vercel.com](https://vercel.com)
2. Import GitHub repository
3. Chọn thư mục `backend` làm root directory
4. Set environment variables
5. Deploy

### Cấu hình Vercel:
```json
// vercel.json (trong thư mục backend)
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

## Tùy chọn 3: Render

### Ưu điểm:
- ✅ Miễn phí tier
- ✅ Hỗ trợ Docker
- ✅ Auto-deploy từ GitHub
- ✅ Có database PostgreSQL miễn phí

### Cách deploy:
1. Truy cập [Render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repository
4. Chọn thư mục `backend`
5. Set build command: `npm run build`
6. Set start command: `npm run start:prod`

## Tùy chọn 4: Heroku

### Ưu điểm:
- ✅ Dễ sử dụng
- ✅ Nhiều add-ons
- ✅ Git-based deployment

### Nhược điểm:
- ❌ Không còn free tier
- ❌ $7/tháng minimum

## Tùy chọn 5: DigitalOcean App Platform

### Ưu điểm:
- ✅ $5/tháng
- ✅ Hỗ trợ Docker
- ✅ Managed database

## Khuyến nghị: Railway

**Railway** là lựa chọn tốt nhất vì:
1. **Miễn phí** $5 credit/tháng (đủ cho development)
2. **Dễ setup** - chỉ cần connect GitHub
3. **Auto-deploy** khi push code
4. **Không giới hạn** environment variables
5. **Hỗ trợ NestJS** out-of-the-box

## Bước tiếp theo:

### 1. Chọn platform và deploy backend
### 2. Lấy backend URL
### 3. Cập nhật frontend:

```typescript
// Cập nhật NEXT_PUBLIC_API_URL trong netlify.toml
NEXT_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"
```

### 4. Test integration
### 5. Deploy frontend lên Netlify (chỉ frontend, không có functions)

## Lưu ý:
- Frontend sẽ deploy trên Netlify (chỉ static files)
- Backend sẽ deploy riêng trên platform khác
- Hai services giao tiếp qua HTTP API
- CORS cần được cấu hình đúng trong backend

Cách này sẽ hoàn toàn tránh được giới hạn 4KB của Netlify Functions!
