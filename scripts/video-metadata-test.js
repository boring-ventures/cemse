const { Client } = require("minio");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";

async function analyzeVideoMetadata(fileName) {
  console.log(`🔍 Analyzing video metadata for: ${fileName}`);

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

    // Step 2: Use ffprobe to analyze video metadata (if available)
    console.log("🔍 Analyzing video with ffprobe...");

    const ffprobeCommand = `ffprobe -v quiet -print_format json -show_format -show_streams "${tempPath}"`;

    try {
      const { stdout } = await new Promise((resolve, reject) => {
        exec(ffprobeCommand, (error, stdout, stderr) => {
          if (error) {
            console.log("⚠️ ffprobe not available, skipping detailed analysis");
            resolve({ stdout: null });
          } else {
            resolve({ stdout });
          }
        });
      });

      if (stdout) {
        const metadata = JSON.parse(stdout);
        console.log("📊 Video Metadata Analysis:");
        console.log("Format:", {
          filename: metadata.format.filename,
          nb_streams: metadata.format.nb_streams,
          nb_programs: metadata.format.nb_programs,
          format_name: metadata.format.format_name,
          format_long_name: metadata.format.format_long_name,
          start_time: metadata.format.start_time,
          duration: metadata.format.duration,
          size: metadata.format.size,
          bit_rate: metadata.format.bit_rate,
        });

        // Analyze video streams
        const videoStreams = metadata.streams.filter(
          (s) => s.codec_type === "video"
        );
        const audioStreams = metadata.streams.filter(
          (s) => s.codec_type === "audio"
        );

        console.log(
          "🎥 Video Streams:",
          videoStreams.map((s) => ({
            codec_name: s.codec_name,
            codec_long_name: s.codec_long_name,
            profile: s.profile,
            width: s.width,
            height: s.height,
            coded_width: s.coded_width,
            coded_height: s.coded_height,
            sample_aspect_ratio: s.sample_aspect_ratio,
            display_aspect_ratio: s.display_aspect_ratio,
            pix_fmt: s.pix_fmt,
            level: s.level,
            r_frame_rate: s.r_frame_rate,
            avg_frame_rate: s.avg_frame_rate,
            time_base: s.time_base,
            start_pts: s.start_pts,
            start_time: s.start_time,
            duration_ts: s.duration_ts,
            duration: s.duration,
            bit_rate: s.bit_rate,
            nb_frames: s.nb_frames,
          }))
        );

        console.log(
          "🔊 Audio Streams:",
          audioStreams.map((s) => ({
            codec_name: s.codec_name,
            codec_long_name: s.codec_long_name,
            sample_fmt: s.sample_fmt,
            sample_rate: s.sample_rate,
            channels: s.channels,
            channel_layout: s.channel_layout,
            bits_per_sample: s.bits_per_sample,
            r_frame_rate: s.r_frame_rate,
            avg_frame_rate: s.avg_frame_rate,
            time_base: s.time_base,
            start_pts: s.start_pts,
            start_time: s.start_time,
            duration_ts: s.duration_ts,
            duration: s.duration,
            bit_rate: s.bit_rate,
          }))
        );

        // Check for potential issues
        const issues = [];

        if (videoStreams.length === 0) {
          issues.push("❌ No video streams found");
        }

        if (videoStreams.some((s) => !s.duration || s.duration === "N/A")) {
          issues.push("⚠️ Video stream has no duration information");
        }

        if (
          videoStreams.some(
            (s) => s.start_time && parseFloat(s.start_time) !== 0
          )
        ) {
          issues.push("⚠️ Video stream doesn't start at time 0");
        }

        if (
          audioStreams.some(
            (s) => s.start_time && parseFloat(s.start_time) !== 0
          )
        ) {
          issues.push("⚠️ Audio stream doesn't start at time 0");
        }

        if (
          metadata.format.start_time &&
          parseFloat(metadata.format.start_time) !== 0
        ) {
          issues.push("⚠️ Container doesn't start at time 0");
        }

        if (issues.length > 0) {
          console.log("🚨 Potential Issues Found:");
          issues.forEach((issue) => console.log(issue));
        } else {
          console.log("✅ No obvious metadata issues found");
        }
      }
    } catch (probeError) {
      console.log("⚠️ Could not analyze with ffprobe:", probeError.message);
    }

    // Step 3: Basic file header analysis
    console.log("🔍 Basic file header analysis:");
    const headerBuffer = fs.readFileSync(tempPath, { start: 0, end: 100 });
    console.log("First 100 bytes (hex):", headerBuffer.toString("hex"));
    console.log(
      "First 100 bytes (ascii):",
      headerBuffer.toString("ascii").replace(/[^\x20-\x7E]/g, ".")
    );

    // Clean up
    fs.unlinkSync(tempPath);
    console.log("🧹 Cleaned up temp file");

    console.log("🎉 Video metadata analysis completed!");
  } catch (error) {
    console.error("❌ Error analyzing video:", error);

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
    await analyzeVideoMetadata(fileName);
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeVideoMetadata };
