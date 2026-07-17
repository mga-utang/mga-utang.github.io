# deploy.ps1 - Build and deploy to GitHub Pages (main branch)
$ErrorActionPreference = "Stop"

Write-Host "Building..." -ForegroundColor Cyan
npx vite build

Write-Host "Copying built files to root..." -ForegroundColor Cyan
Copy-Item dist\index.html index.html -Force

# Clear old assets and copy new ones
Remove-Item assets\* -Force -ErrorAction SilentlyContinue
Copy-Item dist\assets\* assets\ -Force

# Ensure .nojekyll exists
if (-not (Test-Path .nojekyll)) {
    New-Item .nojekyll -ItemType File | Out-Null
}

Write-Host "Done! To deploy, run:" -ForegroundColor Green
Write-Host "  git add index.html assets/ .nojekyll" -ForegroundColor Yellow
Write-Host "  git commit -m 'deploy'" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow
