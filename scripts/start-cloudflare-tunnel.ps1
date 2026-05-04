param(
  [string]$Url = "http://127.0.0.1:3000"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$cloudflaredPath = Join-Path $projectRoot "tools\\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
  Write-Error "cloudflared.exe was not found at $cloudflaredPath. Download it to tools\\cloudflared.exe first."
  exit 1
}

Write-Host ""
Write-Host "Starting Cloudflare quick tunnel..." -ForegroundColor Cyan
Write-Host "Forwarding: $Url" -ForegroundColor Cyan
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "1. Keep this terminal open while testing on your phone."
Write-Host "2. Use the generated https://*.trycloudflare.com URL for QR testing."
Write-Host "3. Stop with Ctrl+C when done."
Write-Host ""

& $cloudflaredPath tunnel --url $Url --no-autoupdate --protocol http2
