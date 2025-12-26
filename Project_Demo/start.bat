@echo off
chcp 65001 >nul
echo ========================================
echo   校园AI助手 - 本地服务器启动脚本
echo ========================================
echo.

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 检测到Node.js
    echo.
    echo 正在使用Node.js启动服务器...
    echo.
    npx http-server -p 8000 -c-1 --cors -o
    goto :end
)

:: 检查Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 检测到Python
    echo.
    echo 正在使用Python启动服务器...
    echo.
    echo 服务器将在 http://localhost:8000 运行
    echo 请在浏览器中打开上述地址
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

:: 检查Python3
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 检测到Python3
    echo.
    echo 正在使用Python3启动服务器...
    echo.
    echo 服务器将在 http://localhost:8000 运行
    echo 请在浏览器中打开上述地址
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python3 -m http.server 8000
    goto :end
)

:: 都没有安装
echo ✗ 未检测到Node.js或Python
echo.
echo 请安装以下任一工具：
echo   1. Node.js: https://nodejs.org/
echo   2. Python: https://www.python.org/
echo.
echo 或者手动打开 index.html 文件（部分功能将受限）
echo.
pause

:end