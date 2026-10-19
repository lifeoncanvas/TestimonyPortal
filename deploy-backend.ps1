# =========================================================
# One-Click Backend Deployment Script for Testimony Portal
# =========================================================
Write-Host ">>> 1. Packaging Spring Boot backend (skipping tests)..." -ForegroundColor Cyan
mvn clean package -DskipTests

$jarPath = "target\testimony-portal-1.0.0.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "Build failed! $jarPath not found." -ForegroundColor Red
    exit 1
}

Write-Host ">>> 2. Uploading JAR to server 148.66.154.222..." -ForegroundColor Cyan
& "C:\Windows\System32\OpenSSH\scp.exe" -o StrictHostKeyChecking=no $jarPath healing@148.66.154.222:/home/healing/

Write-Host ">>> 3. Restarting backend service..." -ForegroundColor Cyan
& "C:\Windows\System32\OpenSSH\ssh.exe" -o StrictHostKeyChecking=no healing@148.66.154.222 "sudo systemctl restart testimony-portal.service && sleep 2 && sudo systemctl status testimony-portal.service --no-pager"

Write-Host ">>> BACKEND DEPLOYMENT COMPLETE!" -ForegroundColor Green
