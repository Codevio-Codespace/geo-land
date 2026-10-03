$ErrorActionPreference = "Continue"
$base = "https://www.geoland-kosova.com"
$outDir = Join-Path $PSScriptRoot "..\research\originals"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$paths = @(
  "/images/services/gisimg.png",
  "/images/services/imgforestry.png",
  "/images/services/mappingandremote.jpg",
  "/images/services/agricultureimg.png",
  "/images/services/ortos.jpg",
  "/images/projets/image.png",
  "/images/projets/kfis1.png",
  "/images/projets/kaveko.jpg",
  "/images/projets/efr.jpg",
  "/images/projets/devvineyard.jpg",
  "/images/projets/rahovec.jpg",
  "/images/projets/31.png",
  "/images/projets/21.png",
  "/images/projets/client-banner.jpg",
  "/images/projets/brezovica.jpg",
  "/images/projets/digitalmap.jpg",
  "/images/projets/reconstruction.jpg",
  "/images/projets/gispeja.jpg",
  "/images/projets/imgaddresingsystem.png",
  "/images/services/uav/uav1.jpg",
  "/images/services/uav/IMG-20200718-WA0016.jpg",
  "/images/services/uav/IMG-20200718-WA0043.jpg",
  "/images/services/uav/ortho1.PNG",
  "/images/services/uav/ortho2.PNG",
  "/images/services/uav/ortho3.PNG",
  "/images/services/uav/orto4.PNG",
  "/images/services/uav/orto5.PNG",
  "/images/services/uav/pointcloud2.PNG",
  "/images/services/uav/dem1.PNG",
  "/images/services/uav/dem2.PNG",
  "/images/services/uav/dem3.PNG",
  "/images/staff/menagment/img1.jpg",
  "/images/staff/geodesy/img1.jpg",
  "/images/staff/sofwtaredeveloper/img1.jpg",
  "/images/staff/agriculture/img1.jpg",
  "/images/certificates/1.jpg",
  "/images/certificates/2.jpg",
  "/images/certificates/3.jpg",
  "/images/companyprofile/CERTI.png",
  "/images/companyprofile/profilecompany.jpg",
  "/images/airbusGroup/AIRBUS.jpg",
  "/images/airbusGroup/intro.png",
  "/images/airbusGroup/r54519_9_constellation-imagery-062019.jpg",
  "/images/gallery/001.jpg",
  "/images/gallery/003.jpg",
  "/images/gallery/005.jpg",
  "/images/gallery/008.jpg",
  "/images/gallery/010.jpg",
  "/images/gallery/012.jpg",
  "/images/gallery/014.jpg",
  "/images/gallery/017.jpg",
  "/images/gallery/020.jpg",
  "/images/gallery/026.jpeg",
  "/images/gallery/027.jpg",
  "/images/gallery/028.jpg"
)

$ok = 0; $fail = 0
foreach ($p in $paths) {
  $slug = ($p.TrimStart("/")) -replace "/", "-"
  $dest = Join-Path $outDir $slug
  if (Test-Path -LiteralPath $dest) { $ok++; continue }
  try {
    Invoke-WebRequest -Uri ($base + $p) -OutFile $dest -UseBasicParsing -TimeoutSec 30
    $ok++
  } catch {
    $fail++
    Write-Host "FAIL: $p"
  }
}
Write-Host "Downloaded: $ok  Failed: $fail"
Get-ChildItem -LiteralPath $outDir -File | Where-Object { $_.Length -eq 0 } | ForEach-Object { Write-Host "EMPTY FILE: $($_.Name)" }
