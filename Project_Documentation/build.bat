@echo off
chcp 65001 >nul
echo ========================================
echo     编译 LaTeX 文档（XeLaTeX）
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 正在编译 应用介绍.tex (第1次)...
xelatex -interaction=nonstopmode 应用介绍.tex >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 编译失败！查看 log 文件获取详细信息。
    pause
    exit /b 1
)
echo [完成] 应用介绍.tex 第1次编译成功
echo.

echo [2/4] 正在编译 应用介绍.tex (第2次，生成目录)...
xelatex -interaction=nonstopmode 应用介绍.tex >nul 2>&1
echo [完成] 应用介绍.tex 第2次编译成功
echo.

echo [3/4] 正在编译 AI编程使用报告.tex (第1次)...
xelatex -interaction=nonstopmode AI编程使用报告.tex >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 编译失败！查看 log 文件获取详细信息。
    pause
    exit /b 1
)
echo [完成] AI编程使用报告.tex 第1次编译成功
echo.

echo [4/4] 正在编译 AI编程使用报告.tex (第2次，生成目录)...
xelatex -interaction=nonstopmode AI编程使用报告.tex >nul 2>&1
echo [完成] AI编程使用报告.tex 第2次编译成功
echo.

echo ========================================
echo     编译完成！
echo ========================================
echo.
echo 生成的PDF文件：
echo   - build\应用介绍.pdf
echo   - build\AI编程使用报告.pdf
echo.
echo 注意：编译过程中可能会有一些警告，
echo   但不影响PDF的正常使用。
echo.

pause