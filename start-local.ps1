$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = 'http://127.0.0.1:8765/'

try {
    Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
} catch {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        throw '没有找到 Node.js。请安装 Node.js 后再运行此脚本。'
    }
    Start-Process -FilePath $node.Source -ArgumentList 'local-server.cjs' -WorkingDirectory $projectRoot -WindowStyle Hidden
    Start-Sleep -Seconds 2
    Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 | Out-Null
}

Start-Process $url
