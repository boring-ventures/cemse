# Video Conversion System Documentation

## Overview

The video conversion system automatically converts uploaded videos to WebM format before storing them in MinIO. This ensures optimal web performance, smaller file sizes, and better browser compatibility.

## Features

- **Automatic WebM Conversion**: Videos are converted to WebM format using FFmpeg with VP9 codec
- **Progress Tracking**: Real-time conversion and upload progress
- **File Validation**: Validates file size and format before processing
- **Optimized Settings**: Uses VP9 video codec and Opus audio codec for best compression
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Architecture

### Components

1. **Video Conversion API** (`/api/video-convert`)

   - Handles video file conversion using FFmpeg
   - Temporary file management
   - Returns converted WebM file

2. **Video Conversion Library** (`/lib/video-conversion.ts`)

   - Client-side conversion utilities
   - Progress tracking
   - File validation

3. **Upload Hook** (`/hooks/useVideoUploadWithConversion.ts`)

   - Orchestrates conversion and upload flow
   - Progress management
   - Error handling

4. **UI Components**
   - `VideoUploadWithConversion`: Enhanced upload component with conversion
   - `VideoLessonForm`: Form for lesson creation with video upload

### Conversion Flow

1. **File Selection**: User selects video file
2. **Validation**: File size and format validation
3. **Conversion Check**: Determines if conversion is needed
4. **Conversion**: Video converted to WebM format (if needed)
5. **Upload**: Converted video uploaded to MinIO
6. **Database**: Lesson record created with video URL

## Usage

### Basic Usage

```typescript
import { VideoLessonForm } from '@/components/video/VideoLessonForm';

<VideoLessonForm
  moduleId="module-123"
  onSuccess={(lessonId) => console.log('Lesson created:', lessonId)}
  onCancel={() => console.log('Upload cancelled')}
/>
```

### Direct Video Upload with Conversion

```typescript
import { useVideoUploadWithConversion } from "@/hooks/useVideoUploadWithConversion";

const { uploadVideoWithConversion, isUploading, uploadProgress } =
  useVideoUploadWithConversion();

const handleUpload = async (videoFile: File) => {
  try {
    const result = await uploadVideoWithConversion({
      title: "My Lesson",
      description: "Lesson description",
      content: "Lesson content",
      moduleId: "module-123",
      contentType: "VIDEO",
      duration: 30,
      orderIndex: 1,
      isRequired: true,
      isPreview: false,
      video: videoFile,
    });
    console.log("Upload successful:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

## Configuration

### Environment Variables

```env
# FFmpeg configuration (optional)
FFMPEG_PATH=/path/to/ffmpeg

# MinIO configuration
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=course-videos
```

### FFmpeg Installation

#### Windows

```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

#### macOS

```bash
# Using Homebrew
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

#### Docker

```dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
```

## Conversion Settings

The system uses the following FFmpeg settings for optimal WebM conversion:

- **Video Codec**: VP9 (`libvpx-vp9`)
- **Audio Codec**: Opus (`libopus`)
- **Video Bitrate**: 1000k (adjustable)
- **Audio Bitrate**: 128k (adjustable)
- **Format**: WebM

## File Validation

### Supported Input Formats

- MP4
- AVI
- MOV
- QuickTime
- WebM (no conversion needed)

### File Size Limits

- Maximum file size: 500MB
- Recommended size: Under 100MB for better user experience

## Error Handling

### Common Errors

1. **FFmpeg Not Found**

   - Install FFmpeg on the system
   - Set `FFMPEG_PATH` environment variable if needed

2. **File Too Large**

   - Reduce file size before upload
   - Adjust `MAX_FILE_SIZE` if needed

3. **Unsupported Format**

   - Convert to supported format first
   - Check file extension and MIME type

4. **Conversion Failed**
   - Check FFmpeg logs
   - Verify file is not corrupted
   - Ensure sufficient disk space

## Performance Considerations

### Conversion Time

- Typical conversion time: ~1 second per MB
- Large files (>100MB) may take several minutes
- Consider implementing queue system for high-volume usage

### Resource Usage

- CPU intensive during conversion
- Temporary disk space needed (2x file size)
- Memory usage scales with file size

### Optimization Tips

1. **Pre-process Videos**: Encourage users to upload smaller files
2. **Queue System**: Implement background job processing for large files
3. **CDN Integration**: Use CDN for video delivery
4. **Caching**: Cache converted videos to avoid re-processing

## Testing

### Manual Testing

1. Navigate to lesson management page
2. Click "Upload Video with Conversion"
3. Fill in lesson details
4. Select a video file
5. Verify conversion progress
6. Check uploaded video plays correctly

### Automated Testing

```bash
# Test conversion API (requires test video file)
node scripts/test-video-conversion.js
```

## Monitoring

### Logs

- Conversion progress logs
- Error logs with stack traces
- Performance metrics

### Metrics to Monitor

- Conversion success rate
- Average conversion time
- File size reduction percentage
- Error rates by file type

## Future Enhancements

1. **Multiple Quality Levels**: Generate multiple resolutions
2. **Thumbnail Generation**: Auto-generate video thumbnails
3. **Progress WebSocket**: Real-time progress updates
4. **Batch Processing**: Convert multiple files simultaneously
5. **Cloud Processing**: Use cloud services for conversion
6. **Video Analytics**: Track video engagement metrics

## Troubleshooting

### FFmpeg Issues

```bash
# Check FFmpeg installation
ffmpeg -version

# Test basic conversion
ffmpeg -i input.mp4 -c:v libvpx-vp9 -c:a libopus output.webm
```

### API Issues

```bash
# Check API endpoint
curl -X POST http://localhost:3000/api/video-convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@test-video.mp4"
```

### File Permission Issues

- Ensure write permissions to temp directory
- Check MinIO bucket permissions
- Verify file upload limits

## Security Considerations

1. **File Validation**: Strict file type and size validation
2. **Temporary Files**: Automatic cleanup of temp files
3. **Authentication**: Required authentication for conversion API
4. **Rate Limiting**: Consider implementing rate limiting
5. **Virus Scanning**: Consider adding virus scanning for uploaded files
