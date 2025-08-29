# FFmpeg Installation Guide

## Current Status

⚠️ **FFmpeg is not currently installed on your system**, which means video conversion to WebM format is not available. Videos will be uploaded in their original format.

## Why Install FFmpeg?

- **Smaller file sizes**: WebM reduces video size by 20-50%
- **Better performance**: Faster loading times for students
- **Browser compatibility**: WebM works across all modern browsers

## Installation Options

### Option 1: Manual Download (Recommended)

1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download the "release builds" → "ffmpeg-release-essentials.zip"
3. Extract to `C:\ffmpeg\`
4. Add `C:\ffmpeg\bin` to your Windows PATH environment variable
5. Restart your terminal/IDE

### Option 2: Using Chocolatey (Run as Administrator)

```powershell
# Install Chocolatey first if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg -y
```

### Option 3: Using Winget

```powershell
winget install "FFmpeg (Essentials Build)"
```

## Verify Installation

After installation, restart your terminal and run:

```powershell
ffmpeg -version
```

You should see FFmpeg version information.

## Current Fallback Behavior

Until FFmpeg is installed, the video upload system will:

- ✅ Still accept and upload videos
- ✅ Work with all video formats (MP4, AVI, MOV, WebM)
- ⚠️ Skip conversion (videos uploaded in original format)
- ✅ Show appropriate user feedback

## After Installing FFmpeg

Once FFmpeg is installed:

- 🎬 Videos will be automatically converted to WebM
- 📉 File sizes will be reduced significantly
- ⚡ Loading times will improve for students
- 🎯 All benefits of the conversion system will be active

## Testing the Installation

1. Install FFmpeg using one of the methods above
2. Restart your development server: `pnpm dev`
3. Upload a video through the lesson creation form
4. Check the browser console for conversion logs
5. Verify the uploaded video is in WebM format
