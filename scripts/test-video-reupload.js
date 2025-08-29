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

async function reuploadVideoWithMetadata(fileName) {
  console.log(`🔄 Re-uploading video with proper metadata: ${fileName}`);

  const tempDir = path.join(__dirname, "temp");
  const tempPath = path.join(tempDir, fileName);

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Download the video
    console.log("📥 Downloading video from MinIO...");
    const stream = await minioClient.getObject(BUCKET_NAME, fileName);
    const writeStream = fs.createWriteStream(tempPath);

    await new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on("error", reject);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const stats = fs.statSync(tempPath);
    console.log(`✅ Downloaded ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Step 2: Re-upload with proper metadata
    console.log("📤 Re-uploading with corrected metadata...");

    const readStream = fs.createReadStream(tempPath);
    await minioClient.putObject(BUCKET_NAME, fileName, readStream, stats.size, {
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });

    console.log("✅ Re-uploaded with proper metadata");

    // Step 3: Verify the upload
    const newStat = await minioClient.statObject(BUCKET_NAME, fileName);
    console.log("📊 New metadata:", {
      size: newStat.size,
      contentType: newStat.metaData["content-type"],
      lastModified: newStat.lastModified,
    });

    // Clean up
    fs.unlinkSync(tempPath);
    console.log("🧹 Cleaned up temp file");

    console.log("🎉 Video re-upload completed!");
    console.log(
      "🔍 Test the video player now to see if the issue is resolved."
    );
  } catch (error) {
    console.error("❌ Error re-uploading video:", error);

    // Clean up temp file on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    throw error;
  }
}

async function main() {
  const fileName = process.argv[2] || "lesson-1756481137059-w8y4h3unno.mp4";

  try {
    await reuploadVideoWithMetadata(fileName);
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { reuploadVideoWithMetadata };
