# 🚀 EC2 Deployment Complete Guide - Artistry Home / Canvas Project

> **Date:** 6 January 2026  
> **Author:** Prince Sulekhiya  
> **Project:** Wall Art E-commerce (React + Spring Boot + MySQL)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites](#-prerequisites)
3. [AWS EC2 Setup](#-aws-ec2-setup)
4. [Deployment Process](#-deployment-process)
5. [Server Configuration Details](#-server-configuration-details)
6. [Important Commands](#-important-commands)
7. [Troubleshooting Guide](#-troubleshooting-guide)
8. [Future Deployments](#-future-deployments)

---

## 🎯 Project Overview

### Tech Stack
| Component | Technology | Port |
|-----------|------------|------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | 80 (via Nginx) |
| Backend | Spring Boot 3.2.5 + Java 21 | 8081 |
| Database | MySQL 8.0 | 3306 |
| Web Server | Nginx | 80 |
| OS | Ubuntu 24.04 LTS | - |

### Project Structure
```
Canvas/
├── FE/                    # Frontend (React)
│   ├── src/
│   ├── dist/              # Build output
│   └── package.json
├── backend/               # Backend (Spring Boot)
│   ├── src/
│   ├── target/            # Build output (JAR)
│   └── pom.xml
├── deploy-to-ec2.ps1      # Deployment script
└── EC2_DEPLOYMENT_GUIDE.md # This file
```

---

## 🔧 Prerequisites

### Local Machine (Windows)
- [x] Node.js v16+ (for frontend build)
- [x] Maven or Maven Wrapper (for backend build)
- [x] OpenSSH client (Windows 10+ has it built-in)
- [x] PowerShell
- [x] AWS account with EC2 access

### AWS Requirements
- [x] EC2 instance (Ubuntu recommended)
- [x] Key pair (.pem file) for SSH access
- [x] Security Group with required ports open

---

## ☁️ AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure:
   - **Name:** ArtistryHome-Server (or any name)
   - **AMI:** Ubuntu Server 24.04 LTS
   - **Instance Type:** t2.micro (free tier) or c7i-flex.large
   - **Key Pair:** Create new or select existing (download .pem file!)
   - **Network Settings:** Allow SSH (port 22)

### Step 2: Note Instance Details

After launch, note these details:

| Property | Our Value |
|----------|-----------|
| Instance ID | `i-0df9cdcdcd71b888e` |
| Public IP | `3.110.69.104` |
| Public DNS | `ec2-3-110-69-104.ap-south-1.compute.amazonaws.com` |
| Key Pair | `prince-aws` |
| Region | `ap-south-1` (Mumbai) |

### Step 3: Configure Security Group

Go to **EC2 → Security Groups → Select your SG → Edit Inbound Rules**

Add these rules:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | 0.0.0.0/0 | Remote access |
| HTTP | 80 | 0.0.0.0/0 | Website access |
| HTTPS | 443 | 0.0.0.0/0 | SSL (optional) |
| Custom TCP | 8081 | 0.0.0.0/0 | Backend direct (optional) |

---

## 🚀 Deployment Process

### Method 1: Automated Script (Recommended)

```powershell
# From project root directory
.\deploy-to-ec2.ps1 -EC2User ubuntu -EC2Host 3.110.69.104 -KeyPath "D:\cloud nexus project\prince-aws.pem"
```

The script automatically:
1. Builds frontend (`npm run build`)
2. Builds backend (`mvn package`)
3. Packages artifacts (zip/jar)
4. Uploads to EC2 via SCP
5. Installs dependencies (Java, Nginx, MySQL)
6. Configures services
7. Starts everything

### Method 2: Manual Deployment

#### Step 1: Build Frontend
```powershell
cd FE
npm install
npm run build
# Output: FE/dist/
```

#### Step 2: Build Backend
```powershell
cd backend
mvn -DskipTests package
# Output: backend/target/backend-1.0.0.jar
```

#### Step 3: Upload to EC2
```powershell
# Create deployment directory
ssh -i "path/to/key.pem" ubuntu@3.110.69.104 "mkdir -p /home/ubuntu/deploy"

# Upload frontend
scp -i "path/to/key.pem" -r FE/dist/* ubuntu@3.110.69.104:/home/ubuntu/deploy/frontend/

# Upload backend
scp -i "path/to/key.pem" backend/target/backend-1.0.0.jar ubuntu@3.110.69.104:/home/ubuntu/deploy/
```

#### Step 4: SSH into Server
```powershell
ssh -i "D:\cloud nexus project\prince-aws.pem" ubuntu@3.110.69.104
```

#### Step 5: Install Software (on EC2)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install -y openjdk-21-jre-headless

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server

# Install unzip
sudo apt install -y unzip
```

#### Step 6: Setup MySQL
```bash
# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database
sudo mysql << 'EOF'
CREATE DATABASE IF NOT EXISTS wallart;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Prince@123';
FLUSH PRIVILEGES;
EOF
```

#### Step 7: Deploy Frontend
```bash
# Copy files to Nginx directory
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r /home/ubuntu/deploy/frontend/* /usr/share/nginx/html/
```

#### Step 8: Deploy Backend
```bash
# Create app directory
sudo mkdir -p /opt/app
sudo cp /home/ubuntu/deploy/backend-1.0.0.jar /opt/app/backend.jar
sudo chown ubuntu:ubuntu /opt/app/backend.jar
```

#### Step 9: Create Backend Service
```bash
sudo tee /etc/systemd/system/backend.service > /dev/null << 'EOF'
[Unit]
Description=Backend Java Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/app
ExecStart=/usr/bin/java -jar /opt/app/backend.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable backend.service
sudo systemctl start backend.service
```

#### Step 10: Configure Nginx
```bash
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Remove default config
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🗂️ Server Configuration Details

### File Locations on EC2

| Purpose | Path |
|---------|------|
| Frontend files | `/usr/share/nginx/html/` |
| Backend JAR | `/opt/app/backend.jar` |
| Nginx config | `/etc/nginx/conf.d/app.conf` |
| Backend service | `/etc/systemd/system/backend.service` |
| Nginx logs | `/var/log/nginx/` |
| Backend logs | `journalctl -u backend.service` |
| MySQL data | `/var/lib/mysql/` |

### Service Names
- `nginx` - Web server
- `backend` - Spring Boot application
- `mysql` - Database server

### Ports Used
- **80** - Nginx (HTTP)
- **443** - Nginx (HTTPS, if configured)
- **8081** - Backend (Spring Boot)
- **3306** - MySQL
- **22** - SSH

### Database Configuration
```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/wallart
spring.datasource.username=root
spring.datasource.password=Prince@123
server.port=8081
```

---

## 💻 Important Commands

### SSH Access
```powershell
# Connect to server
ssh -i "D:\cloud nexus project\prince-aws.pem" ubuntu@3.110.69.104
```

### Service Management (on EC2)
```bash
# Backend
sudo systemctl start backend
sudo systemctl stop backend
sudo systemctl restart backend
sudo systemctl status backend

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# MySQL
sudo systemctl start mysql
sudo systemctl stop mysql
sudo systemctl restart mysql
sudo systemctl status mysql
```

### View Logs (on EC2)
```bash
# Backend logs (live)
sudo journalctl -u backend.service -f

# Backend logs (last 100 lines)
sudo journalctl -u backend.service -n 100

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Check Services Status (on EC2)
```bash
# All services
sudo systemctl status nginx backend mysql

# Check listening ports
sudo ss -tlnp | grep -E ':80|:8081|:3306'

# Check running processes
ps aux | grep -E 'nginx|java|mysql'
```

### Database Commands (on EC2)
```bash
# Login to MySQL
sudo mysql

# Inside MySQL
SHOW DATABASES;
USE wallart;
SHOW TABLES;
SELECT * FROM users LIMIT 10;
```

---

## 🔧 Troubleshooting Guide

### Problem 1: Website not loading (Connection Timeout)

**Cause:** Security Group port not open

**Solution:**
1. AWS Console → EC2 → Security Groups
2. Edit Inbound Rules
3. Add HTTP (port 80) with source 0.0.0.0/0
4. Save rules

### Problem 2: Backend not starting

**Check logs:**
```bash
sudo journalctl -u backend.service -n 50
```

**Common causes:**
- Java version mismatch → Install Java 21
- Database not running → `sudo systemctl start mysql`
- Wrong database password → Check application.properties

### Problem 3: API calls failing (404)

**Check Nginx config:**
```bash
sudo cat /etc/nginx/conf.d/app.conf
sudo nginx -t
```

**Make sure proxy_pass is correct:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8081/api/;
}
```

### Problem 4: Database connection error

**Check MySQL is running:**
```bash
sudo systemctl status mysql
```

**Check database exists:**
```bash
sudo mysql -e "SHOW DATABASES;"
```

**Create database if missing:**
```bash
sudo mysql -e "CREATE DATABASE wallart;"
```

### Problem 5: Permission denied errors

```bash
# Fix file permissions
sudo chown -R ubuntu:ubuntu /opt/app/
sudo chown -R www-data:www-data /usr/share/nginx/html/
```

### Problem 6: Java version mismatch

```bash
# Check current Java version
java --version

# Install Java 21 if needed
sudo apt install -y openjdk-21-jre-headless

# Verify
java --version
```

---

## 🔄 Future Deployments

### Quick Redeploy (Full)
```powershell
.\deploy-to-ec2.ps1 -EC2User ubuntu -EC2Host 3.110.69.104 -KeyPath "D:\cloud nexus project\prince-aws.pem"
```

### Frontend Only Update
```powershell
# Build locally
cd FE
npm run build

# Package
Compress-Archive -Path "dist\*" -DestinationPath "frontend.zip" -Force

# Upload
scp -i "D:\cloud nexus project\prince-aws.pem" frontend.zip ubuntu@3.110.69.104:/home/ubuntu/deploy/

# Deploy on server
ssh -i "D:\cloud nexus project\prince-aws.pem" ubuntu@3.110.69.104 "cd /home/ubuntu/deploy && unzip -o frontend.zip -d frontend_new && sudo rm -rf /usr/share/nginx/html/* && sudo cp -r frontend_new/* /usr/share/nginx/html/"
```

### Backend Only Update
```powershell
# Build locally
cd backend
mvn -DskipTests package

# Upload
scp -i "D:\cloud nexus project\prince-aws.pem" target/backend-1.0.0.jar ubuntu@3.110.69.104:/home/ubuntu/deploy/

# Deploy on server
ssh -i "D:\cloud nexus project\prince-aws.pem" ubuntu@3.110.69.104 "sudo cp /home/ubuntu/deploy/backend-1.0.0.jar /opt/app/backend.jar && sudo systemctl restart backend"
```

---

## 🌐 Live URLs

| Purpose | URL |
|---------|-----|
| Website | http://3.110.69.104 |
| API Base | http://3.110.69.104/api |
| Categories API | http://3.110.69.104/api/categories |
| Products API | http://3.110.69.104/api/products |

---

## 📁 Local Files Reference

| File | Location |
|------|----------|
| SSH Key | `D:\cloud nexus project\prince-aws.pem` |
| Project | `D:\cloud nexus project\Canvas\` |
| Deploy Script | `D:\cloud nexus project\Canvas\deploy-to-ec2.ps1` |
| This Guide | `D:\cloud nexus project\Canvas\EC2_DEPLOYMENT_GUIDE.md` |

---

## 🏗️ Architecture Diagram

```
                            ┌─────────────────────────────────────────────────┐
                            │              AWS EC2 Instance                   │
                            │            (Ubuntu 24.04 LTS)                   │
                            │              3.110.69.104                       │
                            │                                                 │
┌──────────┐   Port 80      │  ┌─────────┐      ┌──────────┐    ┌─────────┐  │
│  User    │ ──────────────▶│  │  Nginx  │─────▶│ Backend  │───▶│  MySQL  │  │
│ Browser  │                │  │  :80    │      │  :8081   │    │  :3306  │  │
└──────────┘                │  └─────────┘      └──────────┘    └─────────┘  │
                            │       │                                         │
                            │       ▼                                         │
                            │  /usr/share/nginx/html/                         │
                            │  ├── index.html                                 │
                            │  ├── assets/                                    │
                            │  │   ├── index.css                              │
                            │  │   ├── index.js                               │
                            │  │   └── images...                              │
                            │  └── ...                                        │
                            │                                                 │
                            │  /opt/app/backend.jar                           │
                            │                                                 │
                            └─────────────────────────────────────────────────┘

Request Flow:
1. User opens http://3.110.69.104
2. Nginx serves frontend files (HTML, CSS, JS)
3. Frontend makes API calls to /api/*
4. Nginx proxies /api/* requests to Backend (port 8081)
5. Backend queries MySQL database
6. Response flows back to user
```

---

## ✅ Deployment Checklist

Use this checklist for future deployments:

- [ ] EC2 instance is running
- [ ] Security Group has port 22, 80 open
- [ ] SSH key (.pem file) is accessible
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend builds successfully (`mvn package`)
- [ ] Files uploaded to EC2
- [ ] Java 21 installed on EC2
- [ ] MySQL installed and running
- [ ] Database 'wallart' created
- [ ] Nginx installed and configured
- [ ] Backend service created and running
- [ ] Website accessible via public IP

---

## 📞 Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                         │
├────────────────────────────────────────────────────────────┤
│ Website:    http://3.110.69.104                            │
│ SSH:        ssh -i "prince-aws.pem" ubuntu@3.110.69.104    │
│ Key File:   D:\cloud nexus project\prince-aws.pem          │
├────────────────────────────────────────────────────────────┤
│ COMMANDS ON EC2:                                           │
│   View backend logs:  sudo journalctl -u backend -f        │
│   Restart backend:    sudo systemctl restart backend       │
│   Restart nginx:      sudo systemctl restart nginx         │
│   Check all status:   sudo systemctl status nginx backend  │
├────────────────────────────────────────────────────────────┤
│ REDEPLOY:                                                  │
│   .\deploy-to-ec2.ps1 -EC2User ubuntu -EC2Host 3.110.69.104│
│   -KeyPath "D:\cloud nexus project\prince-aws.pem"         │
└────────────────────────────────────────────────────────────┘
```

---

**Document Created:** 6 January 2026  
**Last Updated:** 6 January 2026
