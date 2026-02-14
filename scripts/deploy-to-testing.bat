@echo off
:: Sets the window title
Title GitHub Automation Tool

:: Move into the script's parent directory
cd /d "%~dp0.."

echo ----------------------------------------
echo [1/4] Updating Manifest...
echo ----------------------------------------
node scripts/generate-quiz-manifest.js

:: Check if the node script failed
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Error: Failed to generate manifest.
    pause
    exit /b
)

echo.
echo ----------------------------------------
echo [2/4] Going to main branch (testing)...
echo ----------------------------------------

git checkout main

echo.
echo ----------------------------------------
echo [3/4] Preparing Commit...
echo ----------------------------------------

:: Ask for input. If empty, use a default.
set /p "commitMsg=Enter commit message (Press Enter for default): "
if "%commitMsg%"=="" set "commitMsg=Automated update"

git add .
git commit -m "%commitMsg%"

echo.
echo ----------------------------------------
echo [4/4] Pushing to GitHub...
echo ----------------------------------------
git push

:: Check if the push succeeded
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo Success! All changes pushed.
) else (
    color 0C
    echo.
    echo Error: Push failed.
)

pause