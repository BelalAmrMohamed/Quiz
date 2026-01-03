@echo off
:: Move into the script's directory
cd /d "%~dp0"

:: Update the Script/examManifest.js using this automatic tool
node tools/generateExamManifest.js

:: Upload the Chagnes to GitHub
git add "Exams"
git add Script/examManifest.js
git commit -m "Uploading new Exams"
git push