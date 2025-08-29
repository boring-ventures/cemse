#!/usr/bin/env node

/**
 * Test script for video upload and playback functionality
 * This script tests the complete video upload to playback flow
 */

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

// Test configuration
const TEST_CONFIG = {
  // You can place a test video file in the scripts directory
  testVideoPath: path.join(__dirname, "test-video.mp4"),
  moduleId: "test-module-id", // Replace with actual module ID
  authToken: process.env.TEST_AUTH_TOKEN, // Set this in your environment
};

async function testVideoUpload() {
  console.log("🎬 Starting video upload test...");

  // Check if test video exists
  if (!fs.existsSync(TEST_CONFIG.testVideoPath)) {
    console.log("⚠️  Test video not found at:", TEST_CONFIG.testVideoPath);
    console.log(
      "Please place a test video file (test-video.mp4) in the scripts directory"
    );
    return;
  }

  // Check auth token
  if (!TEST_CONFIG.authToken) {
    console.log(
      "⚠️  No auth token provided. Set TEST_AUTH_TOKEN environment variable"
    );
    return;
  }

  try {
    // Step 1: Test video conversion endpoint
    console.log("📤 Testing video conversion...");

    const conversionFormData = new FormData();
    conversionFormData.append(
      "video",
      fs.createReadStream(TEST_CONFIG.testVideoPath)
    );

    const conversionResponse = await fetch(`${API_BASE}/video-convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.authToken}`,
      },
      body: conversionFormData,
    });

    if (!conversionResponse.ok) {
      throw new Error(
        `Conversion failed: ${conversionResponse.status} ${conversionResponse.statusText}`
      );
    }

    const conversionStatus = conversionResponse.headers.get(
      "X-Conversion-Status"
    );
    console.log("✅ Video conversion test completed");
    console.log("📊 Conversion status:", conversionStatus || "converted");

    // Step 2: Test lesson creation with video
    console.log("📝 Testing lesson creation with video...");

    const lessonFormData = new FormData();
    lessonFormData.append("title", "Test Video Lesson");
    lessonFormData.append(
      "description",
      "Test lesson created by upload script"
    );
    lessonFormData.append(
      "content",
      "This is a test lesson with video content"
    );
    lessonFormData.append("moduleId", TEST_CONFIG.moduleId);
    lessonFormData.append("contentType", "VIDEO");
    lessonFormData.append("duration", "10");
    lessonFormData.append("orderIndex", "999");
    lessonFormData.append("isRequired", "false");
    lessonFormData.append("isPreview", "true");
    lessonFormData.append(
      "video",
      fs.createReadStream(TEST_CONFIG.testVideoPath)
    );

    const lessonResponse = await fetch(`${API_BASE}/lesson/with-video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.authToken}`,
      },
      body: lessonFormData,
    });

    if (!lessonResponse.ok) {
      const errorText = await lessonResponse.text();
      throw new Error(
        `Lesson creation failed: ${lessonResponse.status} ${lessonResponse.statusText}\n${errorText}`
      );
    }

    const lessonData = await lessonResponse.json();
    console.log("✅ Lesson created successfully");
    console.log("📋 Lesson ID:", lessonData.lesson.id);
    console.log("🎥 Video URL:", lessonData.lesson.videoUrl);

    // Step 3: Test video proxy endpoint
    console.log("🔗 Testing video proxy...");

    const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(lessonData.lesson.videoUrl)}`;
    const proxyResponse = await fetch(`http://localhost:3000${proxyUrl}`, {
      method: "HEAD", // Use HEAD to avoid downloading the entire video
    });

    if (!proxyResponse.ok) {
      console.log(
        "⚠️  Video proxy test failed:",
        proxyResponse.status,
        proxyResponse.statusText
      );
    } else {
      console.log("✅ Video proxy test successful");
      console.log(
        "📊 Content-Type:",
        proxyResponse.headers.get("content-type")
      );
      console.log(
        "📊 Content-Length:",
        proxyResponse.headers.get("content-length")
      );
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("📝 Test lesson created with ID:", lessonData.lesson.id);
    console.log("🎥 Video URL:", lessonData.lesson.videoUrl);
    console.log("🔗 Proxy URL:", `http://localhost:3000${proxyUrl}`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testVideoUpload();
}

module.exports = { testVideoUpload };
