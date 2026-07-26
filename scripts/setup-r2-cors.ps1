# Apply R2 bucket CORS so browser can PUT uploads from admin panel.
# Requires: npx wrangler login (once)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$corsFile = Join-Path $PSScriptRoot "r2-cors.json"

# Read bucket name from env.local / .env.local
$envFile = Join-Path $root "env.local"
if (-not (Test-Path $envFile)) { $envFile = Join-Path $root ".env.local" }

$bucket = "stand-archive"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*R2_BUCKET_NAME=(.+)$') { $bucket = $Matches[1].Trim() }
  }
}

Write-Host "Setting CORS on R2 bucket: $bucket"
Set-Location $root
npx wrangler r2 bucket cors set $bucket --file $corsFile --force
