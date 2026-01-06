Quick EC2 deploy (Windows PowerShell)

Overview
- This repo contains a frontend (`FE`) built with Vite and a Java backend in `backend/`.
- `deploy-to-ec2.ps1` automates: local build, package, upload, remote install (Java/nginx), systemd service for backend, and nginx configuration to serve the frontend and proxy `/api/` to the backend.

Prerequisites (local)
- Windows with PowerShell
- Node (v16+), npm
- Java is not required locally for packaging (the project includes `mvnw.cmd`), but JDK/Maven may be needed if you modify build behavior
- OpenSSH client installed (for `ssh` and `scp`) — Windows 10+ usually has this
- An EC2 key-pair (`.pem`) file downloaded locally

AWS setup (short)
- Launch an EC2 instance (Amazon Linux 2 or Ubuntu recommended)
- Create/download a key pair, note public IP
- In the instance's Security Group, open inbound ports: `22`, `80`, `443` (optional), and backend port (default `8080`) if you need direct access

Usage
Open PowerShell in the repo root and run:

```powershell
.\deploy-to-ec2.ps1 -EC2User ec2-user -EC2Host 1.2.3.4 -KeyPath C:\path\to\mykey.pem
```

- For Ubuntu instances use `-EC2User ubuntu` instead of `ec2-user`.
- To change backend port (if your app listens on a different port), add `-BackendPort 8080`.
- The script will build `FE` and `backend`, package artifacts, upload them to the EC2 host, install required packages remotely, create a systemd unit for the backend, and configure nginx to serve the frontend and proxy `/api/`.

Notes & next steps
- After first deployment consider assigning an Elastic IP or DNS name.
- To enable HTTPS, run Certbot on the EC2 instance (I can add an automated Certbot step if you want).
- If something fails, check `journalctl -u backend.service` and `sudo journalctl -u nginx` on the server for logs.

Want me to:
- add an automated Certbot step?
- create an equivalent Bash deploy script for Linux/macOS?
