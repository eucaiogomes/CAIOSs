# Baixa e extrai Open Design portable (Windows x64)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Target = Join-Path $Root "caios-data\open-design\portable"
$Zip = Join-Path $Target "open-design-portable.zip"
$Url = "https://github.com/nexu-io/open-design/releases/download/open-design-v0.11.0/open-design-0.11.0-win-x64-portable.zip"

New-Item -ItemType Directory -Force -Path $Target | Out-Null

$existing = Get-ChildItem -Path $Target -Recurse -Filter "Open Design.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    Write-Host "Open Design portable ja instalado: $($existing.FullName)"
    exit 0
}

Write-Host "Baixando Open Design portable (~310 MB)..."
Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing

Write-Host "Extraindo..."
Expand-Archive -Path $Zip -DestinationPath $Target -Force
Remove-Item $Zip -Force

$exe = Get-ChildItem -Path $Target -Recurse -Filter "Open Design.exe" | Select-Object -First 1
if ($exe) {
    Write-Host "Instalado: $($exe.FullName)"
} else {
    Write-Host "Extraido em $Target - procure o .exe manualmente"
}