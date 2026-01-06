param(
    [Parameter(Mandatory=$true)][string]$EC2User,
    [Parameter(Mandatory=$true)][string]$EC2Host,
    [Parameter(Mandatory=$true)][string]$KeyPath,
    [string]$RemoteDir = "",
    [int]$SSHPort = 22,
    [int]$BackendPort = 8080
)

# Set default RemoteDir based on EC2User if not provided
if ([string]::IsNullOrEmpty($RemoteDir)) {
    $RemoteDir = "/home/$EC2User/deploy"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EC2 Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Validate key file
if (-not (Test-Path -Path $KeyPath)) {
    Write-Error "Key file not found at: $KeyPath"
    Write-Host "Download your .pem key from AWS Console -> EC2 -> Key Pairs" -ForegroundColor Yellow
    exit 1
}

$origDir = Get-Location
Set-Location $PSScriptRoot

# ========== Build frontend ==========
if (Test-Path "FE\package.json") {
    Write-Host "`n[1/5] Building frontend (FE)..." -ForegroundColor Green
    Push-Location FE
    if (Test-Path "package-lock.json") { npm ci } else { npm install }
    npm run build
    Pop-Location
} else {
    Write-Warning "[1/5] FE/package.json not found — skipping frontend build."
}

# ========== Build backend ==========
if (Test-Path "backend\mvnw.cmd") {
    Write-Host "`n[2/5] Building backend with mvnw..." -ForegroundColor Green
    Push-Location backend
    .\mvnw.cmd -DskipTests package
    Pop-Location
} elseif (Test-Path "backend\pom.xml") {
    Write-Host "`n[2/5] Building backend with mvn..." -ForegroundColor Green
    Push-Location backend
    mvn -DskipTests package
    Pop-Location
} else {
    Write-Warning "[2/5] backend/pom.xml not found — skipping backend build."
}

# ========== Package artifacts ==========
Write-Host "`n[3/5] Packaging artifacts..." -ForegroundColor Green
$ts = Get-Date -Format "yyyyMMddHHmmss"
$frontendZip = "frontend_$ts.zip"
$backendJar = "backend_$ts.jar"

if (Test-Path "FE\dist") {
    if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
    Compress-Archive -Path "FE\dist\*" -DestinationPath $frontendZip -Force
    Write-Host "  -> $frontendZip created"
} else {
    Write-Warning "  FE/dist not found — frontend zip not created."
}

$jarFile = Get-ChildItem -Path "backend\target" -Filter "*.jar" -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -notlike "*-sources*" -and $_.Name -notlike "*-javadoc*" -and $_.Name -notlike "*-original*" } |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($jarFile) {
    Copy-Item $jarFile.FullName -Destination $backendJar -Force
    Write-Host "  -> $backendJar created"
} else {
    Write-Warning "  No JAR found in backend/target — backend jar not created."
}

# ========== Upload to EC2 ==========
Write-Host "`n[4/5] Uploading to EC2 ($EC2Host)..." -ForegroundColor Green

# Create remote directory
$sshTarget = "${EC2User}@${EC2Host}"
& ssh -i $KeyPath -p $SSHPort -o StrictHostKeyChecking=accept-new $sshTarget "mkdir -p $RemoteDir"

# Upload frontend zip
if (Test-Path $frontendZip) {
    $scpDest = "${sshTarget}:${RemoteDir}/"
    & scp -i $KeyPath -P $SSHPort $frontendZip $scpDest
    Write-Host "  -> Uploaded $frontendZip"
}

# Upload backend jar
if (Test-Path $backendJar) {
    $scpDest = "${sshTarget}:${RemoteDir}/"
    & scp -i $KeyPath -P $SSHPort $backendJar $scpDest
    Write-Host "  -> Uploaded $backendJar"
}

# ========== Remote setup script ==========
$remoteScript = @'
#!/bin/bash
set -e
DEPLOY_DIR=__DEPLOY_DIR__
BACKEND_PORT=__BACKEND_PORT__
EC2_USER=__EC2_USER__

cd $DEPLOY_DIR

# Detect OS and install packages
if [ -f /etc/os-release ]; then source /etc/os-release; fi
if [[ "$ID" == "amzn" ]] || [[ "$ID_LIKE" == *"rhel"* ]]; then
  sudo yum update -y
  sudo yum install -y java-11-openjdk nginx unzip
elif [[ "$ID" == "ubuntu" ]] || [[ "$ID_LIKE" == *"debian"* ]]; then
  sudo apt-get update -y
  sudo apt-get install -y openjdk-11-jre nginx unzip
else
  sudo apt-get update -y || sudo yum update -y || true
  sudo apt-get install -y openjdk-11-jre nginx unzip || sudo yum install -y java-11-openjdk nginx unzip || true
fi

# Unpack frontend
if ls $DEPLOY_DIR/frontend_*.zip 1>/dev/null 2>&1; then
  rm -rf /tmp/frontend_unpack
  unzip -o $DEPLOY_DIR/frontend_*.zip -d /tmp/frontend_unpack
  sudo mkdir -p /usr/share/nginx/html
  sudo rm -rf /usr/share/nginx/html/*
  sudo cp -r /tmp/frontend_unpack/* /usr/share/nginx/html/
  echo "Frontend deployed to /usr/share/nginx/html"
fi

# Deploy backend jar
if ls $DEPLOY_DIR/backend_*.jar 1>/dev/null 2>&1; then
  sudo mkdir -p /opt/app
  sudo cp $DEPLOY_DIR/backend_*.jar /opt/app/backend.jar
  sudo chown $EC2_USER:$EC2_USER /opt/app/backend.jar
  echo "Backend JAR deployed to /opt/app/backend.jar"
fi

# Create systemd service
sudo tee /etc/systemd/system/backend.service > /dev/null <<EOF
[Unit]
Description=Backend Java Service
After=network.target

[Service]
User=$EC2_USER
WorkingDirectory=/opt/app
ExecStart=/usr/bin/java -jar /opt/app/backend.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable backend.service
sudo systemctl restart backend.service || true
echo "Backend service started"

# Configure nginx
sudo tee /etc/nginx/conf.d/app.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Remove default nginx config if exists
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

sudo nginx -t && sudo systemctl restart nginx
echo "Nginx configured and restarted"
echo "Deployment complete!"
'@

# Replace placeholders
$remoteScript = $remoteScript -replace '__DEPLOY_DIR__', $RemoteDir
$remoteScript = $remoteScript -replace '__BACKEND_PORT__', $BackendPort
$remoteScript = $remoteScript -replace '__EC2_USER__', $EC2User

# Convert to Unix line endings (LF)
$remoteScript = $remoteScript -replace "`r`n", "`n"
$remoteScript = $remoteScript -replace "`r", "`n"

# Write script to temp file with Unix line endings
$tempScript = Join-Path $env:TEMP "deploy_remote_$ts.sh"
[System.IO.File]::WriteAllText($tempScript, $remoteScript)

# Upload and execute
$scpDest = "${sshTarget}:${RemoteDir}/"
& scp -i $KeyPath -P $SSHPort $tempScript $scpDest
Write-Host "  -> Uploaded remote setup script"

Write-Host "`n[5/5] Running remote setup on EC2..." -ForegroundColor Green
$remoteScriptPath = "$RemoteDir/deploy_remote_$ts.sh"
& ssh -i $KeyPath -p $SSHPort $sshTarget "chmod +x $remoteScriptPath && bash $remoteScriptPath"

# Cleanup local artifacts (optional)
# Remove-Item $frontendZip, $backendJar, $tempScript -ErrorAction SilentlyContinue

Set-Location $origDir

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "  Visit: http://$EC2Host" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
