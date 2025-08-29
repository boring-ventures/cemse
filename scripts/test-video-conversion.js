const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

async function testVideoConversion() {
  try {
    console.log("🎬 Testing video conversion API...");

    // You would need to have a test video file
    const testVideoPath = path.join(__dirname, "temp", "test-video.mp4");

    if (!fs.existsSync(testVideoPath)) {
      console.log("❌ Test video file not found at:", testVideoPath);
      console.log(
        "Please place a test video file at scripts/temp/test-video.mp4"
      );
      return;
    }

    const form = new FormData();
    form.append("video", fs.createReadStream(testVideoPath));

    const response = await fetch("http://localhost:3000/api/video-convert", {
      method: "POST",
      body: form,
      headers: {
        Authorization: "Bearer YOUR_TEST_TOKEN_HERE", // Replace with actual token
        ...form.getHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.log("❌ Conversion failed:", error);
      return;
    }

    const convertedVideo = await response.buffer();
    const outputPath = path.join(__dirname, "temp", "converted-video.webm");

    fs.writeFileSync(outputPath, convertedVideo);

    console.log("✅ Video conversion successful!");
    console.log("📁 Original file:", testVideoPath);
    console.log("📁 Converted file:", outputPath);
    console.log("📊 Original size:", fs.statSync(testVideoPath).size, "bytes");
    console.log("📊 Converted size:", convertedVideo.length, "bytes");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testVideoConversion();
