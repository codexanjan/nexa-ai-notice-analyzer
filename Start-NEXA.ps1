$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nexaPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $nexaPython)) {
    Write-Host 'Setting up NEXA. Python 3.12 or newer must be installed.'
    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 -m venv .venv
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        & python -m venv .venv
    } else {
        throw 'Install Python from https://www.python.org/downloads/ and then run Start-NEXA.cmd again.'
    }
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the Python environment.' }
}
$nexaMarker = Join-Path $PSScriptRoot '.venv\nexa-ready-1.2.1'
if (-not (Test-Path -LiteralPath $nexaMarker)) {
    & $nexaPython -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw 'Dependency setup failed. Check your internet connection and retry.' }
    New-Item -ItemType File -Path $nexaMarker -Force | Out-Null
}
if (-not (Test-Path -LiteralPath 'frontend\dist\index.html')) {
    throw 'The interface is missing. Download the NEXA portable release ZIP, or build the frontend using the README instructions.'
}
Write-Host 'NEXA is starting at http://127.0.0.1:8000'
Write-Host 'Open that address in your browser. Keep this window open; press Ctrl+C to stop.'
& $nexaPython -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
if ($LASTEXITCODE -ne 0) { throw 'NEXA could not start. Check whether another app is using port 8000.' }
