# Juris8 DS Preview Helper
# Run this from PowerShell to easily preview the Landing Page + Leads UI

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$port = 8000
$landingUrl = "http://localhost:$port/site/index.html"
$leadsUrl   = "http://localhost:$port/ui_kits/det-monitor/leads.html"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Juris8 Design System — Preview" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo no navegador..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Landing Page (form envia leads reais para Supabase):" -ForegroundColor Green
Write-Host "  $landingUrl" -ForegroundColor White
Write-Host ""
Write-Host "Caixa de Leads (busca real + source tracking):" -ForegroundColor Green
Write-Host "  $leadsUrl" -ForegroundColor White
Write-Host ""
Write-Host "Dica: Na Caixa de Leads use o botão " -NoNewline -ForegroundColor Cyan
Write-Host "+ Lead teste" -ForegroundColor Magenta -NoNewline
Write-Host " para popular rapidamente." -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor." -ForegroundColor Yellow
Write-Host ""

# Open browser (non-blocking)
Start-Process $landingUrl
Start-Sleep -Milliseconds 400
Start-Process $leadsUrl

# Prefer Python if available, fallback to npx http-server
$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    python -m http.server $port
} else {
    npx --yes http-server . -p $port -c-1 --cors
}
