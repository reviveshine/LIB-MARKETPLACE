# Complete LIB MARKETPLACE Project Structure Fix and Update Script

Write-Host "🔧 Fixing and Updating Complete LIB MARKETPLACE Project..." -ForegroundColor Green

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Navigate to project root
Set-Location "C:\Users\reviv\Projects\LIB-MARKETPLACE"

# Clean up problematic nested directories
Write-Host "🧹 Cleaning up project structure..." -ForegroundColor Yellow

if (Test-Path "Backend\backend") {
    Write-Host "Removing nested backend directory..." -ForegroundColor Yellow
    Remove-Item "Backend\backend" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "backend\Backend") {
    Write-Host "Removing duplicate Backend directory..." -ForegroundColor Yellow
    Remove-Item "backend\Backend" -Recurse -Force -ErrorAction SilentlyContinue
}

# Rename Backend to backend (lowercase for consistency)
if (Test-Path "Backend" -and !(Test-Path "backend")) {
    Write-Host "Renaming Backend to backend..." -ForegroundColor Yellow
    Rename-Item "Backend" "backend"
}

# Create proper directory structure
Write-Host "📁 Creating proper directory structure..." -ForegroundColor Yellow

$directories = @(
    "backend\src\config",
    "backend\src\controllers",
    "backend\src\middleware",
    "backend\src\models",
    "backend\src\routes",
    "backend\src\services",
    "backend\src\utils",
    "backend\src\validators",
    "backend\tests\unit",
    "backend\tests\integration",
    "backend\logs",
    "backend\uploads",
    "frontend\src\components",
    "frontend\src\pages",
    "frontend\src\services",
    "frontend\src\utils",
    "frontend\src\styles",
    "frontend\public",
    "frontend\dist",
    "assets\images",
    "assets\logos",
    "docs\api",
    "scripts"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

# Create .gitkeep files for empty directories
@("backend\logs", "backend\uploads", "frontend\dist") | ForEach-Object {
    if (!(Test-Path "$_\.gitkeep")) {
        New-Item -ItemType File -Path "$_\.gitkeep" -Force | Out-Null
    }
}

Write-Host "🎉 Project structure fixed successfully!" -ForegroundColor Green