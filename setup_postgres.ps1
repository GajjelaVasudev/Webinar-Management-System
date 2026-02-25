# PostgreSQL Database Setup Script for Webinar Management System
# Run this script after installing PostgreSQL

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup for Webinar System" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get PostgreSQL password
Write-Host "Enter the password you set during PostgreSQL installation:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Step 1: Creating database 'webinar_db'..." -ForegroundColor Green

# Set PostgreSQL password for psql
$env:PGPASSWORD = $password

# Try to create database
$createDbCommand = "CREATE DATABASE webinar_db;"
Write-Host $createDbCommand | psql -U postgres -h localhost 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database 'webinar_db' created successfully!" -ForegroundColor Green
} else {
    Write-Host "Note: Database may already exist or check your password" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Updating .env file with your password..." -ForegroundColor Green

# Update .env file with actual password
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace "DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE", "DB_PASSWORD=$password"
$envContent | Set-Content .env -NoNewline

Write-Host "✓ .env file updated!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Running Django migrations..." -ForegroundColor Green
python manage.py migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create superuser: python manage.py createsuperuser" -ForegroundColor White
Write-Host "2. Start server: python manage.py runserver" -ForegroundColor White
Write-Host ""

# Clear password from environment
Remove-Item Env:\PGPASSWORD
