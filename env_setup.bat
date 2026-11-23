@echo off

echo ==========================================
echo  Environment Setup - Playwright Framework
echo ==========================================

echo.
echo [1/8] Installing test data, env vars, date/time handling...
call npm install dotenv @faker-js/faker luxon
if errorlevel 1 goto :error

echo.
echo [2/8] Installing API / data validation...
call npm install ajv csv-parse xlsx
if errorlevel 1 goto :error

echo.
echo [3/8] Installing accessibility testing (WCAG)...
call npm install @axe-core/playwright
if errorlevel 1 goto :error

echo.
echo [4/8] Installing Allure reporting...
call npm install allure-playwright
if errorlevel 1 goto :error

echo.
echo [5/8] Installing MySQL database support...
call npm install mysql2
if errorlevel 1 goto :error

echo.
echo [6/8] Installing Node.js TypeScript type definitions...
call npm install -D @types/node
if errorlevel 1 goto :error

echo.
echo [7/8] Installing Playwright browsers...
call npx playwright install
if errorlevel 1 goto :error

echo.
echo ==========================================
echo  Environment Setup Completed Successfully
echo ==========================================
pause
exit /b 0

:error
echo.
echo ==========================================
echo  ERROR: Installation Failed
echo ==========================================
echo.
echo Check the error message above for details.
echo Resolve the issue and run env_setup.bat again.
echo.
pause
exit /b 1