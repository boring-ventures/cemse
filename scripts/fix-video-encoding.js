const { exec } = require("child_process");
const { Client } = require("minio");
const fs = require("fs");
const path = require("path");

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";

async function fixVideoFile(fileName) {
  console.log(`🔧 Starting video fix for: ${fileName}`);

  const tempDir = path.join(__dirname, "temp");
  const originalPath = path.join(tempDir, `original_${fileName}`);
  const fixedPath = path.join(tempDir, `fixed_${fileName}`);

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Download the corrupted video from MinIO
    console.log("📥 Downloading video from MinIO...");
    const stream = await minioClient.getObject(BUCKET_NAME, fileName);
    const writeStream = fs.createWriteStream(originalPath);

    await new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on("error", reject);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log("✅ Video downloaded successfully");

    // Step 2: Re-encode the video with FFmpeg
    console.log("🎬 Re-encoding video with FFmpeg...");

    const ffmpegCommand = [
      "ffmpeg",
      "-i",
      `"${originalPath}"`,
      "-c:v",
      "libx264", // H.264 video codec
      "-c:a",
      "aac", // AAC audio codec
      "-movflags",
      "+faststart", // Optimize for web streaming
      "-preset",
      "medium", // Balance between speed and compression
      "-crf",
      "23", // Good quality setting
      "-pix_fmt",
      "yuv420p", // Ensure compatibility
      "-f",
      "mp4", // Force MP4 container
      "-y", // Overwrite output file
      `"${fixedPath}"`,
    ].join(" ");

    await new Promise((resolve, reject) => {
      exec(
        ffmpegCommand,
        { maxBuffer: 1024 * 1024 * 10 },
        (error, stdout, stderr) => {
          if (error) {
            console.error("❌ FFmpeg error:", error);
            console.error("FFmpeg stderr:", stderr);
            reject(error);
          } else {
            console.log("✅ Video re-encoded successfully");
            console.log("FFmpeg stdout:", stdout);
            resolve();
          }
        }
      );
    });

    // Step 3: Verify the fixed video
    console.log("🔍 Verifying fixed video...");
    const stats = fs.statSync(fixedPath);
    console.log(
      `📊 Fixed video size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
    );

    // Step 4: Upload the fixed video back to MinIO
    console.log("📤 Uploading fixed video to MinIO...");

    const readStream = fs.createReadStream(fixedPath);
    await minioClient.putObject(BUCKET_NAME, fileName, readStream, stats.size, {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
    });

    console.log("✅ Fixed video uploaded successfully");

    // Step 5: Clean up temp files
    console.log("🧹 Cleaning up temporary files...");
    fs.unlinkSync(originalPath);
    fs.unlinkSync(fixedPath);

    console.log("🎉 Video fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing video:", error);

    // Clean up temp files on error
    try {
      if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
      if (fs.existsSync(fixedPath)) fs.unlinkSync(fixedPath);
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }

    throw error;
  }
}

// Check if FFmpeg is available
function checkFFmpeg() {
  return new Promise((resolve, reject) => {
    exec("ffmpeg -version", (error, stdout, stderr) => {
      if (error) {
        console.error("❌ FFmpeg not found. Please install FFmpeg first.");
        console.error("Download from: https://ffmpeg.org/download.html");
        reject(new Error("FFmpeg not available"));
      } else {
        console.log("✅ FFmpeg is available");
        resolve();
      }
    });
  });
}

async function main() {
  const fileName = process.argv[2];

  if (!fileName) {
    console.log("Usage: node fix-video-encoding.js <filename>");
    console.log(
      "Example: node fix-video-encoding.js lesson-1756481137059-w8y4h3unno.mp4"
    );
    process.exit(1);
  }

  try {
    await checkFFmpeg();
    await fixVideoFile(fileName);
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixVideoFile };
