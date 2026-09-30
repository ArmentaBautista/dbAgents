# dbtools — Script instalador one-liner para PowerShell
# Uso:
#   irm https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.ps1 | iex
# O con argumentos:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.ps1))) opencode kilocode

[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InstallArgs
)

# 1. Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js no esta instalado o no se encuentra en el PATH." -ForegroundColor Red
    Write-Host "Por favor instala Node.js (v16+) desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Si se ejecuta localmente (en la misma carpeta del instalador o repo)
$LocalScript = Join-Path $PSScriptRoot "dbtools\install.js"
if (-not (Test-Path $LocalScript)) {
    $LocalScript = Join-Path $PSScriptRoot "install.js"
}
if ($PSScriptRoot -and (Test-Path $LocalScript)) {
    & node $LocalScript @InstallArgs
    exit $LASTEXITCODE
}

# 3. Si se ejecuta remotamente (One-liner)
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("dbtools-install-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    $Repo = if ($env:DBTOOLS_REPO) { $env:DBTOOLS_REPO } else { "https://github.com/ArmentaBautista/dbAgents/archive/refs/heads/main.zip" }
    $ZipPath = Join-Path $TempDir "dbagents.zip"
    $ExtractPath = Join-Path $TempDir "extracted"

    Write-Host "Descargando dbAgents..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $Repo -OutFile $ZipPath -UseBasicParsing

    Write-Host "Extrayendo archivos..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force

    $InstallerJs = Get-ChildItem -Path $ExtractPath -Filter "install.js" -Recurse | Select-Object -First 1
    if (-not $InstallerJs) {
        throw "No se encontro install.js en el paquete descargado."
    }

    Write-Host "Ejecutando instalador dbtools..." -ForegroundColor Green
    & node $InstallerJs.FullName @InstallArgs
}
catch {
    Write-Host "[ERROR] Fallo la instalacion: $_" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
