@echo off
REM QUICKSTART - Garagem Inteligente Full-Stack
REM Execute este arquivo para iniciar o projeto rapidamente

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║  🏎️  GARAGEM INTELIGENTE - QUICKSTART                    ║
echo ║                                                           ║
echo ║  Full-Stack: Node.js + MongoDB + Express                 ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Cores (aproximadas - Windows CMD tem limitações)

echo 📝 Verificando pré-requisitos...
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js instalado
node --version

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)
echo ✅ npm instalado
npm --version

echo.
echo 📦 Instalando dependências...
call npm install

if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor...
echo.

echo ═══════════════════════════════════════════════════
echo 🎯 Servidor iniciando...
echo 📡 Acesse: http://localhost:3001
echo 🌐 Interface: http://localhost:3001/public/index-fullstack.html
echo 📊 Banco: MongoDB
echo 🚪 Porta: 3001
echo ═══════════════════════════════════════════════════
echo.

REM Iniciar servidor
call npm start

pause
exit /b 0
