#Requires -Version 5.1
<#
  Generates a release keystore (if missing), writes android/keystore.properties,
  runs assembleRelease, and copies the APK to dist/task-manager-release.apk

  Optional env vars (otherwise a strong random password is generated once):
    ANDROID_KEYSTORE_PASSWORD
    ANDROID_KEY_PASSWORD
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$AndroidDir = Join-Path $Root "android"
$KeystorePath = Join-Path $AndroidDir "task-manager-release.keystore"
$PropsPath = Join-Path $AndroidDir "keystore.properties"
$GradleW = Join-Path $AndroidDir "gradlew.bat"

if (-not (Test-Path $GradleW)) {
    Write-Error "android/gradlew.bat not found. Run: npx expo prebuild --platform android"
}

function Get-KeytoolPath {
    $cmd = Get-Command keytool -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    if ($env:JAVA_HOME) {
        $p = Join-Path $env:JAVA_HOME "bin\keytool.exe"
        if (Test-Path $p) { return $p }
    }
    $candidates = @(
        "C:\Program Files\Java\jdk-21\bin\keytool.exe",
        "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    return $null
}

$KeytoolExe = Get-KeytoolPath
if (-not $KeytoolExe) {
    Write-Error "keytool not found. Install a JDK or Android Studio JBR and set JAVA_HOME, or add JDK bin to PATH."
}

function New-RandomPassword {
    $chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

if (-not (Test-Path $KeystorePath)) {
    $storePass = if ($env:ANDROID_KEYSTORE_PASSWORD) { $env:ANDROID_KEYSTORE_PASSWORD } else { New-RandomPassword }
    $keyPass = if ($env:ANDROID_KEY_PASSWORD) { $env:ANDROID_KEY_PASSWORD } else { $storePass }

    $dname = 'CN=Task Manager, OU=Mobile, O=TaskManager, L=Local, ST=Local, C=US'
    & $KeytoolExe -genkeypair -v `
        -storetype PKCS12 `
        -keystore $KeystorePath `
        -alias taskmanager `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass $storePass `
        -keypass $keyPass `
        -dname $dname

    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $relStore = "../task-manager-release.keystore"
    $propsText = @"
storeFile=$relStore
storePassword=$storePass
keyPassword=$keyPass
keyAlias=taskmanager
"@
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($PropsPath, $propsText.TrimEnd() + "`n", $utf8NoBom)

    Write-Host ""
    Write-Host "Created release keystore and android/keystore.properties (local only; do not commit)." -ForegroundColor Yellow
    Write-Host "Back up android/task-manager-release.keystore and your passwords; you need them for Play updates." -ForegroundColor Yellow
    Write-Host ""
} elseif (-not (Test-Path $PropsPath)) {
    Write-Error "Keystore exists but android/keystore.properties is missing. Restore it or delete the keystore to regenerate (not recommended if already published)."
}

$Dist = Join-Path $Root "dist"
if (-not (Test-Path $Dist)) { New-Item -ItemType Directory -Path $Dist | Out-Null }

Push-Location $AndroidDir
try {
    & .\gradlew.bat assembleRelease --no-daemon
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$Apk = Join-Path $Root "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $Apk)) {
    Write-Error "Expected APK not found: $Apk"
}

$Out = Join-Path $Dist "task-manager-release.apk"
Copy-Item -Path $Apk -Destination $Out -Force
Write-Host ""
Write-Host "Release APK: $Out" -ForegroundColor Green
Write-Host ""
