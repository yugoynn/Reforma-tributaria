@echo off
chcp 65001 >nul
title Simulador da Reforma Tributaria (React)
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERRO] Node.js nao encontrado.
  echo  Instale o Node.js LTS em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  Instalando dependencias ^(so na primeira vez^)...
  call npm install
  if errorlevel 1 (
    echo  [ERRO] Falha no npm install.
    pause
    exit /b 1
  )
)

echo.
echo  Iniciando o simulador em http://localhost:5173
echo  O navegador abre sozinho. Para encerrar, feche esta janela ou aperte Ctrl+C.
echo.
call npm run dev
pause
