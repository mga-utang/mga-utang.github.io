# deploy.ps1 - Build and deploy to GitHub Pages (main branch)
# Handles the dev/prod index.html swap automatically.
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

# Replace root index.html with the built version for deployment
Copy-Item dist\index.html index.html -Force

Write-Host "Committing and pushing..." -ForegroundColor Cyan
git add .
git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
git push origin main 2>&1

Write-Host ""
Write-Host "Deployed! Restoring source index.html for local dev..." -ForegroundColor Green
git checkout HEAD~1 -- index.html

Write-Host "Done. Local dev server will work normally with 'npx vite'." -ForegroundColor Green
