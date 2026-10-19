# =========================================================
# One-Click Frontend Deployment Script for Testimony Portal
# =========================================================
Write-Host ">>> 1. Building React frontend..." -ForegroundColor Cyan
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run build

if (-not (Test-Path "build\index.html")) {
    Write-Host "Build failed! index.html not found in build directory." -ForegroundColor Red
    exit 1
}

Write-Host ">>> 2. Creating deploy bundle..." -ForegroundColor Cyan
Remove-Item -Force deploy.zip -ErrorAction SilentlyContinue
Compress-Archive -Path build\* -DestinationPath deploy.zip -Force

Write-Host ">>> 3. Uploading to server 148.66.154.222..." -ForegroundColor Cyan
& "C:\Windows\System32\OpenSSH\scp.exe" -o StrictHostKeyChecking=no deploy.zip healing@148.66.154.222:/home/healing/

Write-Host ">>> 4. Deploying on server & restarting Nginx..." -ForegroundColor Cyan
& "C:\Windows\System32\OpenSSH\ssh.exe" -o StrictHostKeyChecking=no healing@148.66.154.222 "sudo unzip -o /home/healing/deploy.zip -d /var/www/testimony/ && sudo cp -r /var/www/testimony/* /usr/share/nginx/html/ && sudo chown -R www-data:www-data /var/www/testimony /usr/share/nginx/html && sudo chmod -R 755 /var/www/testimony /usr/share/nginx/html && sudo systemctl restart nginx"

Write-Host ">>> 5. Verification:" -ForegroundColor Green
& "C:\Windows\System32\OpenSSH\ssh.exe" -o StrictHostKeyChecking=no healing@148.66.154.222 "grep -o 'static/js/main.[^.]*.js' /var/www/testimony/index.html"

Write-Host ">>> FRONTEND DEPLOYMENT COMPLETE! Successfully live on https://testimonyportal.com" -ForegroundColor Green
