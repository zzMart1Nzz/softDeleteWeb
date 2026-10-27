@echo off
setlocal
set "WEB_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
    set "WEB_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
    if not exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
        echo Node.js 20 edo berriagoa behar da web zerbitzaria abiarazteko.
        pause
        exit /b 1
    )
)
echo APIa martxan egon behar da http://localhost:5289 helbidean.
echo Weba ireki: http://127.0.0.1:5500
"%WEB_NODE%" "%~dp0zerbitzaria.mjs"
if errorlevel 1 pause
