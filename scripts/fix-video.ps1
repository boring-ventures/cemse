# PowerShell script to fix corrupted video files
param(
    [Parameter(Mandatory=$true)]
    [string]$FileName
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Starting video fix for: $FileName" -ForegroundColor Green

# Check if FFmpeg is available
Write-Host "🔍 Checking for FFmpeg..." -ForegroundColor Blue
$ffmpegAvailable = $false
try {
    $null = ffmpeg -version 2>&1
    $ffmpegAvailable = $true
    Write-Host "✅ FFmpeg is available" -ForegroundColor Green
}
catch {
    Write-Host "❌ FFmpeg not found. Please install FFmpeg first." -ForegroundColor Red
    Write-Host "Download from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

if (-not $ffmpegAvailable) {
    exit 1
}

# Create temp directory
$tempDir = Join-Path $PSScriptRoot "temp"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

$originalPath = Join-Path $tempDir "original_$FileName"
$fixedPath = Join-Path $tempDir "fixed_$FileName"

# Main processing
try {
    # Step 1: Download from MinIO using the API
    Write-Host "📥 Downloading video from MinIO..." -ForegroundColor Blue
    $encodedFileName = [System.Web.HttpUtility]::UrlEncode("http://localhost:9000/course-videos/$FileName")
    $videoUrl = "http://localhost:3000/api/video-proxy?url=$encodedFileName"
    
    Invoke-WebRequest -Uri $videoUrl -OutFile $originalPath
    Write-Host "✅ Video downloaded successfully" -ForegroundColor Green
    
    $originalSize = (Get-Item $originalPath).Length
    Write-Host "📊 Original video size: $([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor Cyan

    # Step 2: Re-encode with FFmpeg
    Write-Host "🎬 Re-encoding video with FFmpeg..." -ForegroundColor Blue
    
    $ffmpegCommand = "ffmpeg -i `"$originalPath`" -c:v libx264 -c:a aac -movflags +faststart -preset medium -crf 23 -pix_fmt yuv420p -f mp4 -y `"$fixedPath`""
    
    Write-Host "Running: $ffmpegCommand" -ForegroundColor Gray
    
    Invoke-Expression $ffmpegCommand
    
    if (!(Test-Path $fixedPath)) {
        throw "FFmpeg did not create output file"
    }
    
    Write-Host "✅ Video re-encoded successfully" -ForegroundColor Green
    
    $fixedSize = (Get-Item $fixedPath).Length
    Write-Host "📊 Fixed video size: $([math]::Round($fixedSize / 1MB, 2)) MB" -ForegroundColor Cyan

    # Step 3: Verify the fixed video
    if ($fixedSize -gt 1000) {
        Write-Host "✅ Fixed video appears valid (size check passed)" -ForegroundColor Green
    } else {
        throw "Fixed video file is too small, encoding may have failed"
    }

    # Step 4: Instructions for manual upload
    Write-Host ""
    Write-Host "📤 Fixed video is ready!" -ForegroundColor Yellow
    Write-Host "Location: $fixedPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps to complete the fix:" -ForegroundColor Yellow
    Write-Host "1. Open MinIO console: http://localhost:9001" -ForegroundColor White
    Write-Host "2. Navigate to the 'course-videos' bucket" -ForegroundColor White
    Write-Host "3. Delete the old file: $FileName" -ForegroundColor White
    Write-Host "4. Upload the new file: $fixedPath" -ForegroundColor White
    Write-Host "5. Test the video player again" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Video fix completed!" -ForegroundColor Green

}
catch {
    Write-Host "❌ Error fixing video: $($_.Exception.Message)" -ForegroundColor Red
    
    # Clean up temp files on error
    if (Test-Path $originalPath) { 
        Remove-Item $originalPath -Force 
        Write-Host "🧹 Cleaned up original temp file" -ForegroundColor Gray
    }
    if (Test-Path $fixedPath) { 
        Remove-Item $fixedPath -Force 
        Write-Host "🧹 Cleaned up fixed temp file" -ForegroundColor Gray
    }
    
    exit 1
}
finally {
    # Clean up original file but keep the fixed one for manual upload
    if (Test-Path $originalPath) { 
        Remove-Item $originalPath -Force 
        Write-Host "🧹 Cleaned up temporary download file" -ForegroundColor Gray
    }
}