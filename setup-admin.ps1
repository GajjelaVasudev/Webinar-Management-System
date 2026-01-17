# Quick Start Script for Admin Dashboard
# Run this script to set up your first admin user

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Admin Dashboard Quick Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Django is running
$djangoRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $djangoRunning) {
    Write-Host "⚠️  Django server is not running on port 8000" -ForegroundColor Yellow
    Write-Host "Please start Django in another terminal: python manage.py runserver" -ForegroundColor Yellow
    Write-Host ""
}

# Prompt for username
$username = Read-Host "Enter username to make admin (or press Enter to create new superuser)"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host ""
    Write-Host "Creating new superuser..." -ForegroundColor Green
    python manage.py createsuperuser
} else {
    Write-Host ""
    Write-Host "Making '$username' an admin..." -ForegroundColor Green
    python manage.py makeadmin $username
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Start Django (if not already running):" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start React frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access admin dashboard:" -ForegroundColor White
Write-Host "   http://localhost:3000/auth" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Login with your admin credentials" -ForegroundColor White
Write-Host ""
Write-Host "✅ Setup complete! Enjoy your admin dashboard!" -ForegroundColor Green
