# 🎨 Artistry Home - Premium Home Decor E-commerce

![Build & Deploy](https://github.com/YOUR_USERNAME/Canvas/actions/workflows/deploy.yml/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/Canvas/actions/workflows/test.yml/badge.svg)

> Premium home decor e-commerce platform featuring canvas paintings, crystal art, wallpapers, and moving gear clocks.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Spring Boot 3.2.5 + Java 21 |
| **Database** | MySQL 8.0 |
| **Deployment** | AWS EC2 + Nginx |
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

```
Canvas/
├── .github/workflows/     # CI/CD pipelines
│   ├── deploy.yml         # Build & Deploy to EC2
│   └── test.yml           # Run tests
├── FE/                    # Frontend (React)
├── backend/               # Backend (Spring Boot)
├── deploy-to-ec2.ps1      # Manual deploy script
└── EC2_DEPLOYMENT_GUIDE.md
```

## 🚀 CI/CD Setup

### Step 1: GitHub Secrets Configuration

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `3.110.69.104` | Your EC2 public IP |
| `EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Contents of your .pem file |

### Step 2: Get SSH Key Content

```powershell
# Copy your .pem file content
Get-Content "D:\cloud nexus project\prince-aws.pem"
```

Copy the entire output (including BEGIN and END lines) and paste as `EC2_SSH_KEY` secret.

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build Frontend (React)
2. ✅ Build Backend (Spring Boot)
3. ✅ Deploy to EC2
4. ✅ Restart services

## 🔧 Local Development

### Frontend
```bash
cd FE
npm install
npm run dev
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

## 📦 Manual Deployment

```powershell
.\deploy-to-ec2.ps1 -EC2User ubuntu -EC2Host 3.110.69.104 -KeyPath "path\to\key.pem"
```

## 🌐 Live URLs

| Environment | URL |
|-------------|-----|
| Production | http://3.110.69.104 |
| API | http://3.110.69.104/api |

## 📞 Contact

**Artistry Home**  
📍 Cloud Nexus, E-5 Arera Colony, Bhopal, MP - 462016  
📞 +91 90095 36046  
✉️ hello@artistryhome.in

---

© 2026 Artistry Home. All rights reserved.
