# deploy.ps1 - Build and deploy to GitHub Pages (main branch)
# The committed index.html is always the built version (for GitHub Pages).
# Local dev uses `npx vite` which processes it correctly.
$ErrorActionPreference = "Stop"

Write-Host "Building..." -ForegroundColor Cyan
npx vite build

Write-Host "Copying built files to root..." -ForegroundColor Cyan

# Update built assets in root
Remove-Item assets\* -Force -ErrorAction SilentlyContinue
Copy-Item dist\assets\* assets\ -Force

# Update root index.html with the built version
Copy-Item dist\index.html index.html -Force

# Ensure .nojekyll exists
if (-not (Test-Path .nojekyll)) {
    New-Item .nojekyll -ItemType File | Out-Null
}

Write-Host ""
Write-Host "Build complete! To deploy:" -ForegroundColor Green
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host "  git commit -m 'deploy'" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow
