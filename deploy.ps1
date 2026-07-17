# deploy.ps1 - Build and deploy to GitHub Pages (main branch)
# IMPORTANT: The source index.html MUST reference /src/main.tsx for Vite to build from source.
# After building, dist/index.html (with hashed assets) is copied to root for GitHub Pages.
$ErrorActionPreference = "Stop"

# Step 1: Ensure source index.html is correct for Vite build
$sourceIndex = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>Sari-Sari Store Community Credit Ledger</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@

Write-Host "Ensuring source index.html..." -ForegroundColor Cyan
Set-Content index.html -Value $sourceIndex -NoNewline

Write-Host "Building from source..." -ForegroundColor Cyan
node node_modules/vite/bin/vite.js build

Write-Host "Copying built files to root..." -ForegroundColor Cyan

# Update built assets in root
Remove-Item assets\* -Force -ErrorAction SilentlyContinue
Copy-Item dist\assets\* assets\ -Force

# Update root index.html with the built version (for GitHub Pages)
Copy-Item dist\index.html index.html -Force

# Ensure .nojekyll exists
if (-not (Test-Path .nojekyll)) {
    New-Item .nojekyll -ItemType File | Out-Null
}

Write-Host ""
Write-Host "Build complete! Committed index.html references built assets." -ForegroundColor Green
Write-Host "To deploy:" -ForegroundColor Green
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host "  git commit -m 'deploy'" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: Run 'deploy.ps1' again before local dev to restore source index.html." -ForegroundColor Magenta
