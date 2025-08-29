# 🎥 Video Upload and Playback Debug Guide

## ✅ **Changes Made to Fix Issues**

### 1. **Enhanced Video Conversion Logging**
- **File**: `src/hooks/useVideoUploadWithConversion.ts`
- **Changes**: Added comprehensive logging for conversion process
- **Purpose**: Track if WebM conversion is actually working

### 2. **Fixed Video File Extension Detection**
- **File**: `src/app/api/lesson/with-video/route.ts`
- **Changes**: Use MIME type instead of filename for extension
- **Purpose**: Ensure converted WebM files get proper `.webm` extension

### 3. **Enhanced Video Conversion API**
- **File**: `src/app/api/video-convert/route.ts`
- **Changes**: Better WebM codec support checking, detailed logging
- **Purpose**: Ensure FFmpeg can properly encode WebM with VP9/Opus

### 4. **Improved VideoPlayer Diagnostics**
- **File**: `src/components/video/VideoPlayer.tsx`
- **Changes**: Enhanced error handling, browser compatibility checks
- **Purpose**: Better decode error diagnosis and user guidance

---

## 🧪 **Testing Steps**

### Step 1: Check Video Upload
1. Go to: `/admin/courses/[courseId]/modules/[moduleId]/lessons`
2. Upload ANY video file (MP4, AVI, MOV, etc.)
3. **Watch browser console** for these logs:
   ```
   🎬 Starting WebM conversion for: {fileName, fileSize, fileType}
   🎬 VideoConverter: Starting WebM conversion
   🎬 === VIDEO CONVERSION API START ===
   🎬 === STARTING CONVERSION TO WEBM ===
   ✅ WebM conversion successful: {details}
   ```

### Step 2: Check File Storage
1. After upload, check console for:
   ```
   🎥 File details: {originalName, mimeType, detectedExtension, finalFileName}
   ```
2. **Expected**: `detectedExtension: "webm"`, `finalFileName: "lesson-xxxxx.webm"`

### Step 3: Check Video Playback
1. Go to: `/development/courses/[enrollmentId]/learn`
2. Play the uploaded video
3. **If decode error occurs**, check console for:
   ```
   🔍 Browser video support analysis: {webm, mp4, userAgent}
   📄 Video URL diagnostics: {status, contentType, contentLength}
   ```

---

## 🐛 **Common Issues and Solutions**

### Issue 1: Still Seeing `.mp4` Files
**Cause**: WebM conversion is failing silently
**Check Console For**:
```
❌ Video conversion to WebM failed: {error details}
⚠️ WARNING: WebM conversion failed! This may cause playback issues.
```
**Solution**: Check FFmpeg installation, WebM codec support

### Issue 2: `PIPELINE_ERROR_DECODE` Errors
**Cause**: Corrupted video file or browser compatibility
**Check Console For**:
```
❌ VideoPlayer - Decode error detected, running comprehensive diagnostics...
🔍 Browser video support analysis: {support details}
```
**Solutions**:
- Use Chrome/Firefox (better WebM support)
- Check if video file is corrupted
- Try re-uploading the original video

### Issue 3: FFmpeg Not Available
**Check Console For**:
```
⚠️ FFmpeg not available, returning original file without conversion
```
**Solution**: Install FFmpeg, set `FFMPEG_PATH` environment variable

---

## 🔧 **Manual Testing Checklist**

- [ ] Upload video shows "Converting to WebM format..." message
- [ ] Conversion completes successfully with compression ratio
- [ ] File saved with `.webm` extension
- [ ] Video plays without decode errors
- [ ] Browser compatibility warnings work (if needed)
- [ ] Error diagnostics provide helpful information

---

## 📋 **Environment Requirements**

### Required:
- **FFmpeg** installed with VP9/Opus codecs
- **MinIO** running and accessible
- **Modern Browser**: Chrome 29+, Firefox 28+, Edge 79+

### Optional Environment Variables:
```env
FFMPEG_PATH=/path/to/ffmpeg  # If not in system PATH
MINIO_ENDPOINT=localhost     # Default: 127.0.0.1
MINIO_PORT=9000             # Default: 9000
MINIO_BUCKET_NAME=course-videos  # Default bucket name
```

---

## 🚀 **Expected Working Flow**

1. **Upload**: User selects video → Shows "WebM conversion required"
2. **Convert**: FFmpeg converts to WebM with VP9/Opus codecs
3. **Store**: WebM file stored in MinIO with `.webm` extension
4. **Serve**: Video proxy serves WebM with correct MIME type
5. **Play**: VideoPlayer displays WebM without decode errors

**Success Indicators**:
- Console shows WebM conversion success messages
- File URLs end with `.webm`
- Videos play smoothly without decode errors
- Diagnostic tools provide helpful compatibility info