param(
    [Parameter(Mandatory = $true)][string]$LinkPath,
    [Parameter(Mandatory = $true)][string]$TargetPath
)

$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $LinkPath) {
    throw "Claude skill path already exists: $LinkPath"
}
if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
    throw "Canonical skill directory is missing: $TargetPath"
}
New-Item -ItemType Junction -Path $LinkPath -Target $TargetPath -ErrorAction Stop | Out-Null
