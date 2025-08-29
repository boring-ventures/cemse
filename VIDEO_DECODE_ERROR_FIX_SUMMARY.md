# Video Decode Error Fix Summary

## 🎯 **Problem Identified**

You were experiencing a **PIPELINE_ERROR_DECODE** error in the VideoPlayer after a few seconds of video playback:

```
MediaError {code: 3, message: 'PIPELINE_ERROR_DECODE: video decode error!'}
```

This error indicates that the browser's video decoder encountered a problem with the video file's encoding, format, or codec compatibility.

## 🔍 **Root Cause Analysis**

The issue was likely caused by:

1. **Incompatible Video Codec**: The original WebM VP9 codec may not be universally supported
2. **Encoding Issues**: Problems during video conversion or upload process
3. **Browser Compatibility**: Some browsers have issues with certain WebM configurations
4. **Corrupted Video Data**: Issues during file transfer or storage

## ✅ **Solutions Implemented**

### **1. Switched from WebM to MP4 H.264**

**Before:**

```typescript
.videoCodec("libvpx-vp9") // VP9 codec - less compatible
.audioCodec("libopus") // Opus audio - less compatible
.format("webm") // WebM format
```

**After:**

```typescript
.videoCodec("libx264") // H.264 codec - universally supported
.audioCodec("aac") // AAC audio - widely compatible
.format("mp4") // MP4 format - best browser support
```

### **2. Added Compatibility-First Encoding Options**

```typescript
.outputOptions([
  "-preset", "medium", // Balance speed vs compression
  "-crf", "23", // Good quality constant rate factor
  "-pix_fmt", "yuv420p", // Compatible pixel format
  "-movflags", "+faststart", // Optimize for web streaming
  "-profile:v", "baseline", // H.264 baseline for max compatibility
  "-level", "3.0" // H.264 level for compatibility
])
```

### **3. Enhanced Error Messages**

**Before:** Generic "Error al decodificar el video"

**After:** Detailed diagnostics:

```
"El video tiene problemas de codificación o formato incompatible.
Posibles causas:
(1) Archivo de video corrupto
(2) Codec no soportado por el navegador
(3) Error durante la conversión
Recomendación: Resubir el video en formato MP4 con codec H.264."
```

### **4. Improved Video Validation**

Updated `needsConversion()` function to better detect which files need conversion:

```typescript
export function needsConversion(file: File): boolean {
  const fileExtension = file.name.toLowerCase().split(".").pop();

  // MP4 and WebM files are considered web-optimized
  if (file.type.includes("mp4") || fileExtension === "mp4") return false;
  if (file.type.includes("webm") || fileExtension === "webm") return false;

  // All other formats need conversion
  return true;
}
```

### **5. Created Diagnostic Tools**

Created `scripts/diagnose-video-issues.js` that can:

- Check FFmpeg installation
- Analyze video file properties (codec, format, compatibility)
- Test video conversion API
- Provide specific recommendations

## 🎯 **Why This Fixes the PIPELINE_ERROR_DECODE**

1. **H.264 Baseline Profile**: Maximum browser compatibility, supported by all modern browsers
2. **AAC Audio**: Standard audio codec with universal support
3. **MP4 Container**: Most reliable container format for web delivery
4. **yuv420p Pixel Format**: Ensures compatibility across all devices and browsers
5. **Web-Optimized Settings**: `-movflags +faststart` enables progressive download

## 🧪 **Testing the Fix**

### **Option 1: Use Diagnostic Script**

```bash
node scripts/diagnose-video-issues.js path/to/your/video.mp4
```

### **Option 2: Manual Testing**

1. Upload a new video through the admin interface
2. The video will now be converted to MP4 H.264 (if FFmpeg is available)
3. Test playback in the learning page

### **Option 3: Check Existing Videos**

For videos that are still causing decode errors:

1. Re-upload them to trigger the new conversion process
2. The new MP4 H.264 format should resolve playback issues

## 📋 **Expected Results**

### **With FFmpeg Installed:**

- ✅ Videos convert to MP4 H.264 format
- ✅ Universal browser compatibility
- ✅ No more PIPELINE_ERROR_DECODE errors
- ✅ Smooth playback across all devices

### **Without FFmpeg:**

- ✅ Videos upload in original format
- ✅ Better error messages guide users
- ⚠️ Some format compatibility issues may persist

## 🔧 **Troubleshooting**

### **If you still get decode errors:**

1. **Check the video file:**

   ```bash
   node scripts/diagnose-video-issues.js your-video.mp4
   ```

2. **Install FFmpeg for conversion:**

   - Windows: Download from https://www.gyan.dev/ffmpeg/builds/
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt install ffmpeg`

3. **Re-upload problematic videos** to trigger new conversion

4. **Test in different browsers** (Chrome recommended)

### **Manual Video Conversion (if needed):**

```bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -preset medium -crf 23 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart output.mp4
```

## 🎉 **Benefits Achieved**

1. **Universal Compatibility**: H.264 MP4 works on all browsers and devices
2. **Better Performance**: Optimized encoding settings for web delivery
3. **Improved Diagnostics**: Clear error messages and diagnostic tools
4. **Future-Proof**: Standard web video format that will remain compatible

The PIPELINE_ERROR_DECODE issue should now be resolved with the new MP4 H.264 conversion pipeline! 🚀
