# Docker & CI/CD Setup Guide

## 📦 Docker Setup

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Edit `.env` file với thông tin của bạn:**
- Thay đổi MongoDB credentials
- Thêm JWT secret key mạnh
- Cấu hình Cloudinary, VNPay, MoMo credentials

3. **Build và chạy containers:**
```bash
# Build và start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

4. **Truy cập ứng dụng:**
- Frontend (Customer): http://localhost:3000
- Frontend (Admin): http://localhost:3000/admin
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Docker Commands

```bash
# Rebuild images
docker-compose build

# Rebuild và restart
docker-compose up -d --build

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service cụ thể
docker-compose restart backend

# Xem danh sách containers
docker-compose ps

# Execute command trong container
docker-compose exec backend npm run dev
docker-compose exec mongodb mongosh

# Clean up
docker system prune -a
docker volume prune
```

## 🚀 GitHub Actions CI/CD

### Setup GitHub Actions

1. **Thêm Secrets vào GitHub Repository:**

Vào Settings → Secrets and variables → Actions, thêm các secrets sau:

**Docker Hub (Optional - nếu muốn push images):**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password hoặc access token

**Deployment (Optional - nếu deploy tự động):**
- `SERVER_HOST`: IP hoặc domain của server
- `SERVER_USERNAME`: SSH username
- `SERVER_SSH_KEY`: Private SSH key

**Code Coverage (Optional):**
- `CODECOV_TOKEN`: Token từ codecov.io

2. **Workflows đã được tạo:**

**`.github/workflows/ci-cd.yml`** - Main pipeline:
- ✅ Chạy tests cho backend
- ✅ Build frontend
- ✅ Build và push Docker images (chỉ trên main branch)
- ✅ Deploy tự động (cần uncomment và cấu hình)

**`.github/workflows/code-quality.yml`** - Code quality:
- ✅ Security audit với npm audit
- ✅ Chạy trên mọi Pull Request

### Workflow Triggers

- **Push to main/develop**: Chạy full pipeline
- **Pull Request**: Chạy tests và code quality checks
- **Manual**: Có thể trigger thủ công từ Actions tab

### Customization

**Bỏ qua Frontend Tests (nếu chưa có):**
Trong `ci-cd.yml`, frontend-test job đã được giữ nhưng không chạy test. Uncomment khi có tests.

**Enable Deployment:**
Uncomment deployment job trong `ci-cd.yml` và cấu hình theo hosting của bạn.

**Add ESLint:**
Uncomment lint steps trong workflows nếu có cấu hình ESLint.

## 🔧 Development Workflow

### Local Development (không dùng Docker):

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Docker Development:

```bash
# Sử dụng docker-compose
docker-compose up -d

# Hot reload: Mount volumes trong docker-compose.yml
```

## 📝 Environment Variables

Xem `.env.example` để biết tất cả các biến môi trường cần thiết.

**Quan trọng:**
- Không commit file `.env` vào Git
- Sử dụng secrets management cho production
- Thay đổi tất cả passwords mặc định

## 🔐 Security Best Practices

1. **Secrets:**
   - Không hard-code secrets trong code
   - Sử dụng GitHub Secrets cho CI/CD
   - Rotate credentials định kỳ

2. **Docker:**
   - Sử dụng multi-stage builds (đã implement)
   - Chạy containers với non-root user (có thể cải thiện)
   - Regular security scans

3. **Dependencies:**
   - Chạy `npm audit` thường xuyên
   - Update dependencies định kỳ
   - Review CVEs

## 📊 Monitoring & Logs

```bash
# View logs
docker-compose logs -f

# Container stats
docker stats

# Health checks
docker-compose ps
```

## 🐛 Troubleshooting

**Container không start:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**MongoDB connection issues:**
- Kiểm tra MONGODB_URI trong .env
- Đảm bảo MongoDB container đã healthy
- Kiểm tra network connectivity

**Port conflicts:**
- Thay đổi ports trong .env file
- Đảm bảo ports không bị dùng bởi process khác

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
