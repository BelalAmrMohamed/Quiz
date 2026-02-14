$ErrorActionPreference = "Stop"
$title = "GitHub Automation Tool"
$host.ui.RawUI.WindowTitle = $title

$mainBranch = "main"
$prodBranch = "production"
$nodeScript = "scripts/generate-quiz-manifest.js"

function Print-Step ($message) {
    Write-Host "`n--- $message ---" -ForegroundColor Cyan
}

function Print-Error ($message) {
    Write-Host "`n[!] $message" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit
}

try {
    # Move to the parent directory
    Set-Location (Split-Path $PSScriptRoot -Parent)
    Write-Host "Working directory: $(Get-Location)" -ForegroundColor Green

    # 1. Check for uncommitted changes
    if ($(git status --porcelain) -ne $null) {
        Print-Error "You have uncommitted changes. Please commit or stash them first."
    }

    # 2. Update Manifest
    Print-Step "[1/5] Updating Manifest"
    node $nodeScript
    if ($LASTEXITCODE -ne 0) { throw "Node script failed" }

    # Check if git needs to commit the manifest
    if ($(git status --porcelain) -ne $null) {
        Write-Host "Committing manifest update..." -ForegroundColor Yellow
        git add .
        git commit -m "chore: update manifest via automation"
    }

    # 3. Switch to Prod
    Print-Step "[2/5] Switching to $prodBranch"
    git checkout $prodBranch

    # 4. Merge
    Print-Step "[3/5] Merging $mainBranch"
    git merge $mainBranch
    if ($LASTEXITCODE -ne 0) { throw "Merge failed" }

    # 5. Push
    Print-Step "[4/5] Pushing to Origin"
    git push origin $prodBranch

    # 6. Return
    Print-Step "[5/5] Returning to $mainBranch"
    git checkout $mainBranch

    Write-Host "`nSUCCESS! Deployment Complete." -ForegroundColor Green
    Read-Host "Press Enter to close..."

} catch {
    Print-Error $_.Exception.Message
}