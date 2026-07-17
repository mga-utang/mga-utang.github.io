# deploy.ps1 - Build and deploy to GitHub Pages (main branch)
# The source index.html (references /src/main.tsx) must stay intact for dev.
# This script builds, then updates ONLY the asset references in root for deployment.
$ErrorActionPreference = "Stop"

Write-Host "Building..." -ForegroundColor Cyan
npx vite build

Write-Host "Updating built assets in root..." -ForegroundColor Cyan

# Clear old built assets and copy new ones
Remove-Item assets\* -Force -ErrorAction SilentlyContinue
Copy-Item dist\assets\* assets\ -Force

# Ensure .nojekyll exists
if (-not (Test-Path .nojekyll)) {
    New-Item .nojekyll -ItemType File | Out-Null
}

# Generate deployment index.html from the built dist/index.html
# This replaces the dev script reference with the built asset references
Copy-Item dist\index.html index.deploy.html -Force

Write-Host ""
Write-Host "Build complete! To deploy:" -ForegroundColor Green
Write-Host "  1. Temporarily swap index.html for deployment:" -ForegroundColor Yellow
Write-Host "     Copy-Item index.deploy.html index.html" -ForegroundColor White
Write-Host "  2. Commit and push:" -ForegroundColor Yellow
Write-Host "     git add . ; git commit -m 'deploy' ; git push origin main" -ForegroundColor White
Write-Host "  3. Restore source index.html for development:" -ForegroundColor Yellow
Write-Host "     git checkout index.html" -ForegroundColor White
