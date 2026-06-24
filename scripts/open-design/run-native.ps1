# Open Design NATIVO no Windows (necessário para Hermes Local CLI + arquivos locais)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PortableDir = Join-Path $Root "caios-data\open-design\portable"
$DeployDir = Join-Path $Root "caios-data\open-design\repo\deploy"

function Wait-PortFree([int]$Port, [int]$Seconds = 60) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    do {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if (-not $conn) { return $true }
        Start-Sleep -Seconds 2
    } while ((Get-Date) -lt $deadline)
    return $false
}

# 1. Parar Docker (Linux não roda Hermes.exe)
if (Test-Path (Join-Path $DeployDir "docker-compose.yml")) {
    Write-Host "Parando Open Design Docker..."
    Push-Location $DeployDir
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    docker compose down *> $null
    $ErrorActionPreference = $prevEap
    Pop-Location
    Wait-PortFree -Port 7456 -Seconds 45 | Out-Null
}

# 2. Parar instância nativa anterior (se houver)
Get-Process -Name "Open Design" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Wait-PortFree -Port 7456 -Seconds 15 | Out-Null

# 3. Garantir portable instalado
$exe = Get-ChildItem -Path $PortableDir -Recurse -Filter "Open Design.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $exe) {
    Write-Host "Portable não encontrado. Instalando..."
    & (Join-Path $PSScriptRoot "install-portable.ps1")
    $exe = Get-ChildItem -Path $PortableDir -Recurse -Filter "Open Design.exe" | Select-Object -First 1
}

if (-not $exe) {
    Write-Error "Open Design.exe não encontrado. Instale manualmente de https://open-design.ai/"
}

# 4. Iniciar Open Design nativo (porta dinâmica — não é 7456)
$running = Get-Process -Name "Open Design" -ErrorAction SilentlyContinue
if (-not $running) {
    Write-Host "Iniciando Open Design nativo: $($exe.FullName)"
    Start-Process -FilePath $exe.FullName -WorkingDirectory $exe.DirectoryName
} else {
    Write-Host "Open Design já em execução ($($running.Count) processo(s))"
}

# 5. Aguardar URL e configurar Hermes + Juris8
Write-Host "Aguardando URL e configurando Hermes + Juris8..."
node (Join-Path $PSScriptRoot "wait-and-configure.mjs")

Write-Host ""
Write-Host "Pronto! Abra http://localhost:1420/open-design no CaiOS"
Write-Host "Ou direto: http://localhost:7456"