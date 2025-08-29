#!/usr/bin/env node

/**
 * Video Issues Diagnostic Script
 * Helps diagnose video encoding and playback issues
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const fetch = require("node-fetch");

const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

async function checkFFmpegInstallation() {
  console.log("🔍 Checking FFmpeg installation...");

  return new Promise((resolve) => {
    exec("ffmpeg -version", (error, stdout, stderr) => {
      if (error) {
        console.log("❌ FFmpeg not installed or not in PATH");
        console.log("   Install FFmpeg from: https://ffmpeg.org/download.html");
        resolve(false);
      } else {
        console.log("✅ FFmpeg is installed");
        const versionLine = stdout.split("\n")[0];
        console.log(`   ${versionLine}`);
        resolve(true);
      }
    });
  });
}

async function analyzeVideoFile(videoPath) {
  console.log(`\n🎥 Analyzing video file: ${path.basename(videoPath)}`);

  if (!fs.existsSync(videoPath)) {
    console.log("❌ Video file not found");
    return null;
  }

  const stats = fs.statSync(videoPath);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  return new Promise((resolve) => {
    exec(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(
            "❌ Could not analyze video file (FFmpeg/FFprobe required)"
          );
          resolve(null);
          return;
        }

        try {
          const data = JSON.parse(stdout);
          const videoStream = data.streams.find(
            (s) => s.codec_type === "video"
          );
          const audioStream = data.streams.find(
            (s) => s.codec_type === "audio"
          );

          console.log("📋 Video Analysis:");
          console.log(`   Format: ${data.format.format_name}`);
          console.log(
            `   Duration: ${parseFloat(data.format.duration).toFixed(2)} seconds`
          );

          if (videoStream) {
            console.log(`   Video codec: ${videoStream.codec_name}`);
            console.log(
              `   Resolution: ${videoStream.width}x${videoStream.height}`
            );
            console.log(`   Pixel format: ${videoStream.pix_fmt}`);
            console.log(`   Profile: ${videoStream.profile || "Unknown"}`);
            console.log(`   Level: ${videoStream.level || "Unknown"}`);
          }

          if (audioStream) {
            console.log(`   Audio codec: ${audioStream.codec_name}`);
            console.log(`   Sample rate: ${audioStream.sample_rate} Hz`);
            console.log(`   Channels: ${audioStream.channels}`);
          }

          // Check for compatibility issues
          console.log("\n🔍 Compatibility Check:");
          const issues = [];

          if (videoStream) {
            if (videoStream.codec_name !== "h264") {
              issues.push(
                `Video codec '${videoStream.codec_name}' may not be compatible with all browsers`
              );
            }

            if (videoStream.pix_fmt && videoStream.pix_fmt !== "yuv420p") {
              issues.push(
                `Pixel format '${videoStream.pix_fmt}' may cause playback issues`
              );
            }

            if (
              videoStream.profile &&
              !["Baseline", "Main", "High"].includes(videoStream.profile)
            ) {
              issues.push(
                `H.264 profile '${videoStream.profile}' may not be widely supported`
              );
            }
          }

          if (
            audioStream &&
            audioStream.codec_name !== "aac" &&
            audioStream.codec_name !== "mp3"
          ) {
            issues.push(
              `Audio codec '${audioStream.codec_name}' may not be compatible with all browsers`
            );
          }

          if (issues.length === 0) {
            console.log("✅ No obvious compatibility issues detected");
          } else {
            console.log("⚠️  Potential issues found:");
            issues.forEach((issue) => console.log(`   - ${issue}`));
          }

          resolve(data);
        } catch (parseError) {
          console.log("❌ Could not parse video analysis");
          resolve(null);
        }
      }
    );
  });
}

async function testVideoConversion(videoPath, authToken) {
  console.log("\n🔄 Testing video conversion API...");

  if (!fs.existsSync(videoPath)) {
    console.log("❌ Test video file not found");
    return false;
  }

  if (!authToken) {
    console.log("⚠️  No auth token provided, skipping API test");
    return false;
  }

  try {
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("video", fs.createReadStream(videoPath));

    const response = await fetch(`${API_BASE}/video-convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.log(
        `❌ Conversion API failed: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
      return false;
    }

    const conversionStatus = response.headers.get("X-Conversion-Status");
    console.log(`✅ Conversion API successful`);
    console.log(`   Status: ${conversionStatus || "converted"}`);
    console.log(`   Content-Type: ${response.headers.get("content-type")}`);

    return true;
  } catch (error) {
    console.log(`❌ Conversion API error: ${error.message}`);
    return false;
  }
}

function generateRecommendations(analysisData, ffmpegAvailable) {
  console.log("\n💡 Recommendations:");

  if (!ffmpegAvailable) {
    console.log("1. Install FFmpeg for video conversion capabilities");
    console.log(
      "   - Windows: Download from https://www.gyan.dev/ffmpeg/builds/"
    );
    console.log("   - macOS: brew install ffmpeg");
    console.log("   - Ubuntu: sudo apt install ffmpeg");
  }

  if (analysisData) {
    const videoStream = analysisData.streams.find(
      (s) => s.codec_type === "video"
    );
    const audioStream = analysisData.streams.find(
      (s) => s.codec_type === "audio"
    );

    if (videoStream && videoStream.codec_name !== "h264") {
      console.log(
        "2. Convert video to H.264 codec for better browser compatibility"
      );
      console.log(
        "   Command: ffmpeg -i input.mp4 -c:v libx264 -c:a aac -preset medium -crf 23 output.mp4"
      );
    }

    if (videoStream && videoStream.pix_fmt !== "yuv420p") {
      console.log("3. Convert pixel format to yuv420p for compatibility");
      console.log("   Add -pix_fmt yuv420p to your ffmpeg command");
    }

    if (audioStream && !["aac", "mp3"].includes(audioStream.codec_name)) {
      console.log("4. Convert audio to AAC for better compatibility");
      console.log("   Add -c:a aac to your ffmpeg command");
    }
  }

  console.log("\n🔧 For PIPELINE_ERROR_DECODE issues:");
  console.log(
    "- Try re-encoding the video with standard web codecs (H.264 + AAC)"
  );
  console.log("- Use baseline H.264 profile for maximum compatibility");
  console.log("- Ensure the video file is not corrupted");
  console.log("- Test with different browsers (Chrome, Firefox, Safari)");
  console.log("- Check browser console for more detailed error information");
}

async function runDiagnostics() {
  console.log("🚀 Video Issues Diagnostic Tool\n");

  const testVideoPath =
    process.argv[2] || path.join(__dirname, "test-video.mp4");
  const authToken = process.env.TEST_AUTH_TOKEN;

  console.log(`Target video: ${testVideoPath}`);
  console.log(`Auth token: ${authToken ? "Provided" : "Not provided"}\n`);

  // Step 1: Check FFmpeg installation
  const ffmpegAvailable = await checkFFmpegInstallation();

  // Step 2: Analyze video file if provided
  let analysisData = null;
  if (fs.existsSync(testVideoPath)) {
    analysisData = await analyzeVideoFile(testVideoPath);
  } else {
    console.log(`\n⚠️  Video file not found: ${testVideoPath}`);
    console.log(
      "   Provide a video file path as argument: node diagnose-video-issues.js /path/to/video.mp4"
    );
  }

  // Step 3: Test conversion API if possible
  if (fs.existsSync(testVideoPath) && authToken) {
    await testVideoConversion(testVideoPath, authToken);
  }

  // Step 4: Generate recommendations
  generateRecommendations(analysisData, ffmpegAvailable);

  console.log("\n📋 Summary:");
  console.log(`- FFmpeg installed: ${ffmpegAvailable ? "✅" : "❌"}`);
  console.log(`- Video analyzed: ${analysisData ? "✅" : "❌"}`);
  console.log(
    `- API tested: ${fs.existsSync(testVideoPath) && authToken ? "✅" : "⚠️  Skipped"}`
  );
}

// Run diagnostics
if (require.main === module) {
  runDiagnostics().catch((error) => {
    console.error("💥 Diagnostic failed:", error.message);
    process.exit(1);
  });
}

module.exports = { runDiagnostics };
