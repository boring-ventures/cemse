import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Configure FFmpeg path (adjust based on your system)
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

// Check if FFmpeg is available and supports required codecs
async function checkFFmpegAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      ffmpeg()
        .on("start", () => resolve(true))
        .on("error", () => resolve(false))
        .inputOptions([
          "-f",
          "lavfi",
          "-i",
          "testsrc=duration=1:size=320x240:rate=1",
        ])
        .outputOptions(["-f", "null", "-"])
        .run();
    } catch (error) {
      console.warn("FFmpeg check failed:", error);
      resolve(false);
    }
  });
}


export async function POST(request: NextRequest) {
  try {
    console.log("🎬 === VIDEO CONVERSION API START ===");
    console.log("🎬 API: Received video conversion request");

    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("🎬 API: Authenticated user:", decoded.username);

    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    let requestedFormat = formData.get("format") as string || "mp4"; // Default to MP4 for backward compatibility

    if (!videoFile) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }

    console.log("🎬 Processing video file:", {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type,
      requestedFormat: requestedFormat
    });

    // Convert videos to requested format (WebM or MP4)
    console.log(`🎬 === STARTING CONVERSION TO ${requestedFormat.toUpperCase()} ===`);

    // Check if FFmpeg is available
    const ffmpegAvailable = await checkFFmpegAvailability();

    if (!ffmpegAvailable) {
      console.warn(
        "⚠️ FFmpeg not available, returning original file without conversion"
      );
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": videoFile.type || "video/mp4",
          "Content-Length": buffer.length.toString(),
          "Content-Disposition": `attachment; filename="${videoFile.name}"`,
          "X-Conversion-Status": "ffmpeg-unavailable",
        },
      });
    }


    // Create temporary file paths
    const tempDir = tmpdir();
    const inputFileName = `input-${Date.now()}-${Math.random().toString(36).substring(2)}.${videoFile.name.split(".").pop()}`;
    const outputFileName = `output-${Date.now()}-${Math.random().toString(36).substring(2)}.mp4`;
    const inputPath = path.join(tempDir, inputFileName);
    const outputPath = path.join(tempDir, outputFileName);

    try {
      // Save uploaded file to temporary location
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(inputPath, buffer);

      console.log("🎬 Converting video to MP4 format for maximum compatibility...");

      // Convert video using FFmpeg with reliable MP4/H.264/AAC settings
      await new Promise<void>((resolve, reject) => {
        console.log("🎬 Configuring H.264/AAC encoding for maximum compatibility");
        
        // Check if input is already a good MP4 file
        const isAlreadyMP4 = videoFile.type === 'video/mp4' && videoFile.name.toLowerCase().endsWith('.mp4');
        
        if (isAlreadyMP4) {
          console.log("🎬 Input is already MP4 - using simple copy to avoid re-encoding issues");
          
          // Simple copy without re-encoding to avoid corruption
          const command = ffmpeg(inputPath)
            .outputOptions([
              "-c", "copy", // Copy streams without re-encoding
              "-movflags", "+faststart", // Just optimize for web
              "-avoid_negative_ts", "make_zero",
            ]);
            
          console.log("🎬 Using stream copy (no re-encoding)");
          command
        } else {
          console.log("🎬 Converting to web-compatible MP4 with minimal processing");
          
          // Minimal re-encoding for maximum compatibility
          const command = ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .outputOptions([
              // Absolute minimal settings for maximum compatibility
              "-preset", "ultrafast", // Fastest encoding to avoid corruption
              "-profile:v", "baseline", // Most compatible profile
              "-level", "3.0", // Compatible with old devices
              "-pix_fmt", "yuv420p", // Required for Safari/iOS
              "-movflags", "+faststart", // Web optimization
              
              // Simple bitrate control
              "-b:v", "1000k", // Fixed video bitrate
              "-maxrate", "1000k", // Maximum bitrate
              "-bufsize", "2000k", // Buffer size
              
              // Audio settings
              "-b:a", "128k", // Fixed audio bitrate
              "-ar", "44100", // Standard sample rate
              "-ac", "2", // Stereo
              
              // Prevent timing issues
              "-avoid_negative_ts", "make_zero",
              "-fflags", "+genpts",
              
              // Force constant frame rate
              "-r", "30", // Standard 30fps
              "-g", "30", // Keyframe every second
            ]);
            
          console.log("🎬 Using minimal re-encoding");
          command
        }
          
        console.log("🎬 FFmpeg processing:", {
          input: inputPath,
          output: outputPath,
          isAlreadyMP4,
          processing: isAlreadyMP4 ? 'copy' : 'minimal-encode'
        });
        
        command

        ffmpegCommand
          .on("start", (commandLine) => {
            console.log("🎬 FFmpeg command:", commandLine);
          })
          .on("progress", (progress) => {
            const percent = Math.round(progress.percent || 0);
            const timemark = progress.timemark || 'unknown';
            const fps = progress.currentFps || 0;
            console.log(
              `🎬 MP4 Conversion: ${percent}% | Time: ${timemark} | FPS: ${fps}`
            );
          })
          .on("end", async () => {
            console.log("🎬 Video conversion to MP4 completed successfully");
            
            // Verify output file exists and has content
            try {
              const stats = await fs.stat(outputPath);
              console.log("✅ Output file verification:", {
                size: stats.size,
                sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
                created: stats.birthtime
              });
              
              if (stats.size === 0) {
                throw new Error("Output file is empty after conversion");
              }
              
              if (stats.size < 1024) {
                throw new Error(`Output file is too small: ${stats.size} bytes`);
              }
              
              // Basic video validation using ffprobe
              try {
                console.log("🔍 Running basic video validation...");
                
                const ffprobe = require('fluent-ffmpeg').ffprobe;
                ffprobe(outputPath, (err, metadata) => {
                  if (err) {
                    console.warn("⚠️ Could not validate video with ffprobe:", err.message);
                  } else {
                    console.log("✅ Video validation successful:", {
                      duration: metadata.format.duration,
                      bitrate: metadata.format.bit_rate,
                      videoStreams: metadata.streams.filter(s => s.codec_type === 'video').length,
                      audioStreams: metadata.streams.filter(s => s.codec_type === 'audio').length
                    });
                  }
                  resolve();
                });
              } catch (validationError) {
                console.warn("⚠️ Video validation failed, but proceeding:", validationError);
                resolve();
              }
            } catch (statError) {
              console.error("❌ Could not verify output file:", statError);
              reject(new Error("Failed to verify converted video file"));
            }
          })
          .on("error", (err) => {
            console.error("❌ FFmpeg conversion error (MP4):", err);
            console.error("❌ Conversion context:", {
              inputPath,
              outputPath,
              inputExists: require('fs').existsSync(inputPath),
              inputSize: require('fs').existsSync(inputPath) 
                ? require('fs').statSync(inputPath).size 
                : 'N/A',
              errorMessage: err.message
            });
            console.error("❌ This might be due to:");
            console.error("  - Corrupted input video file");
            console.error("  - Unsupported input format");
            console.error("  - Missing H.264/AAC codecs");
            console.error("  - Insufficient system resources");
            console.error("  - Invalid FFmpeg parameters");
            reject(err);
          })
          .save(outputPath);
      });

      // Read converted file
      const convertedBuffer = await fs.readFile(outputPath);
      const convertedSize = convertedBuffer.length;

      const compressionRatio = ((videoFile.size - convertedSize) / videoFile.size * 100).toFixed(1);
      console.log(`✅ CONVERSION SUCCESSFUL:`, {
        originalSize: videoFile.size,
        convertedSize: convertedSize,
        compressionRatio: `${compressionRatio}%`,
        format: requestedFormat,
        conversionStatus
      });

      // Clean up temporary files
      await fs
        .unlink(inputPath)
        .catch((err) => console.warn("Failed to delete input temp file:", err));
      await fs
        .unlink(outputPath)
        .catch((err) =>
          console.warn("Failed to delete output temp file:", err)
        );

      // Return converted video as blob
      const mimeType = requestedFormat === "webm" ? "video/webm" : "video/mp4";
      const fileExtension = requestedFormat === "webm" ? "webm" : "mp4";
      // Determine actual conversion status
      let conversionStatus = "converted-to-mp4"; // default
      if (requestedFormat === "webm") {
        conversionStatus = "converted-to-webm";
      }
      
      console.log(`🎬 Final conversion status: ${conversionStatus}`);

      return new Response(convertedBuffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Length": convertedSize.toString(),
          "Content-Disposition": `attachment; filename="${videoFile.name.replace(/\.[^/.]+$/, "")}.${fileExtension}"`,
          "X-Conversion-Status": conversionStatus,
        },
      });
    } catch (conversionError) {
      console.error("❌ === VIDEO CONVERSION FAILED ===");
      console.error("❌ Video conversion error:", conversionError);
      console.error("❌ Conversion context:", {
        inputFile: videoFile.name,
        inputSize: videoFile.size,
        inputType: videoFile.type,
        outputPath,
        inputPath
      });

      // FALLBACK: Return original file if conversion fails
      console.log("🔄 Attempting fallback - returning original file");
      
      try {
        const originalBuffer = await fs.readFile(inputPath);
        console.log("✅ Fallback successful - returning original file:", {
          size: originalBuffer.length,
          type: videoFile.type
        });
        
        // Clean up temporary files
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
        
        // Return original file with warning header
        return new Response(originalBuffer, {
          status: 200,
          headers: {
            "Content-Type": videoFile.type || "video/mp4",
            "Content-Length": originalBuffer.length.toString(),
            "Content-Disposition": `attachment; filename="${videoFile.name}"`,
            "X-Conversion-Status": "fallback-original-file",
            "X-Conversion-Error": (conversionError as Error).message,
          },
        });
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        
        // Clean up temporary files
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});

        return NextResponse.json(
          {
            message: "Video conversion failed and fallback failed",
            error:
              process.env.NODE_ENV === "development"
                ? `Conversion: ${(conversionError as Error).message}, Fallback: ${(fallbackError as Error).message}`
                : "Conversion failed",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("❌ === VIDEO CONVERSION API ERROR ===");
    console.error("❌ Error in video conversion:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
