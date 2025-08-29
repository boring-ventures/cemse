#!/usr/bin/env node

/**
 * Complete Video Flow Test
 * Tests the entire video upload to playback pipeline
 */

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

const API_BASE = process.env.API_BASE || "http://localhost:3000/api";
const WEB_BASE = process.env.WEB_BASE || "http://localhost:3000";

// Test configuration
const TEST_CONFIG = {
  testVideoPath: path.join(__dirname, "test-video.mp4"),
  moduleId: process.env.TEST_MODULE_ID || "test-module-id",
  enrollmentId: process.env.TEST_ENROLLMENT_ID || "test-enrollment-id",
  authToken: process.env.TEST_AUTH_TOKEN,
};

async function createTestVideo() {
  // Create a simple test video using FFmpeg if available
  const testVideoPath = TEST_CONFIG.testVideoPath;

  if (fs.existsSync(testVideoPath)) {
    console.log("✅ Test video already exists");
    return;
  }

  console.log("🎬 Creating test video...");

  // Create a simple 5-second test video
  const { exec } = require("child_process");

  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=30 -f lavfi -i sine=frequency=1000:duration=5 -c:v libx264 -c:a aac -shortest "${testVideoPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(
            "⚠️  Could not create test video with FFmpeg:",
            error.message
          );
          console.log(
            "Please manually place a test video file at:",
            testVideoPath
          );
          resolve(false);
        } else {
          console.log("✅ Test video created successfully");
          resolve(true);
        }
      }
    );
  });
}

async function testVideoConversion() {
  console.log("\n🔄 Testing video conversion...");

  if (!fs.existsSync(TEST_CONFIG.testVideoPath)) {
    throw new Error("Test video not found. Please create a test video first.");
  }

  const formData = new FormData();
  formData.append("video", fs.createReadStream(TEST_CONFIG.testVideoPath));

  const response = await fetch(`${API_BASE}/video-convert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TEST_CONFIG.authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Conversion failed: ${response.status} ${response.statusText}`
    );
  }

  const conversionStatus = response.headers.get("X-Conversion-Status");
  console.log("✅ Video conversion test passed");
  console.log("📊 Status:", conversionStatus || "converted");

  return { status: conversionStatus, response };
}

async function testLessonCreation() {
  console.log("\n📝 Testing lesson creation with video...");

  const formData = new FormData();
  formData.append("title", "Test Video Lesson - Complete Flow");
  formData.append(
    "description",
    "Test lesson for complete video flow validation"
  );
  formData.append(
    "content",
    "This lesson tests the complete video upload and playback flow"
  );
  formData.append("moduleId", TEST_CONFIG.moduleId);
  formData.append("contentType", "VIDEO");
  formData.append("duration", "5");
  formData.append("orderIndex", "999");
  formData.append("isRequired", "false");
  formData.append("isPreview", "true");
  formData.append("video", fs.createReadStream(TEST_CONFIG.testVideoPath));

  const response = await fetch(`${API_BASE}/lesson/with-video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TEST_CONFIG.authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lesson creation failed: ${response.status}\n${errorText}`);
  }

  const lessonData = await response.json();
  console.log("✅ Lesson created successfully");
  console.log("📋 Lesson ID:", lessonData.lesson.id);
  console.log("🎥 Video URL:", lessonData.lesson.videoUrl);

  return lessonData.lesson;
}

async function testVideoProxy(videoUrl) {
  console.log("\n🔗 Testing video proxy...");

  const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;

  // Test HEAD request
  const headResponse = await fetch(`${WEB_BASE}${proxyUrl}`, {
    method: "HEAD",
  });

  if (!headResponse.ok) {
    throw new Error(
      `Video proxy HEAD failed: ${headResponse.status} ${headResponse.statusText}`
    );
  }

  console.log("✅ Video proxy HEAD request successful");
  console.log("📊 Content-Type:", headResponse.headers.get("content-type"));
  console.log("📊 Content-Length:", headResponse.headers.get("content-length"));

  // Test partial content request (range)
  const rangeResponse = await fetch(`${WEB_BASE}${proxyUrl}`, {
    method: "GET",
    headers: {
      Range: "bytes=0-1023",
    },
  });

  if (rangeResponse.status === 206) {
    console.log(
      "✅ Video proxy range requests supported (206 Partial Content)"
    );
  } else if (rangeResponse.ok) {
    console.log("✅ Video proxy works (full content returned)");
  } else {
    throw new Error(
      `Video proxy GET failed: ${rangeResponse.status} ${rangeResponse.statusText}`
    );
  }

  return proxyUrl;
}

async function testVideoPlayback(lesson) {
  console.log("\n🎬 Testing video playback simulation...");

  // Simulate what the VideoPlayer component does
  const videoUrl = lesson.videoUrl;

  // Check if it's a MinIO URL that needs proxy
  const needsProxy =
    videoUrl.includes("127.0.0.1:9000") || videoUrl.includes("localhost:9000");
  const playbackUrl = needsProxy
    ? `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`
    : videoUrl;

  console.log("🎥 Original URL:", videoUrl);
  console.log("🔗 Playback URL:", playbackUrl);
  console.log("🔄 Needs proxy:", needsProxy);

  // Test the playback URL
  const response = await fetch(`${WEB_BASE}${playbackUrl}`, {
    method: "HEAD",
  });

  if (!response.ok) {
    throw new Error(
      `Video playback test failed: ${response.status} ${response.statusText}`
    );
  }

  console.log("✅ Video playback URL accessible");
  console.log("📊 Content-Type:", response.headers.get("content-type"));

  return playbackUrl;
}

async function testEnrollmentVideoAccess(lesson) {
  console.log("\n👨‍🎓 Testing enrollment video access...");

  // Test the enrollment learning endpoint
  const response = await fetch(
    `${API_BASE}/course-enrollments/${TEST_CONFIG.enrollmentId}/learning`,
    {
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.authToken}`,
      },
    }
  );

  if (!response.ok) {
    console.log(
      "⚠️  Enrollment learning endpoint test skipped (enrollment may not exist)"
    );
    return;
  }

  const enrollmentData = await response.json();
  console.log("✅ Enrollment data retrieved");
  console.log("📚 Course:", enrollmentData.course?.title || "Unknown");
  console.log("📊 Modules:", enrollmentData.course?.modules?.length || 0);

  // Look for our test lesson
  const testLesson = enrollmentData.course?.modules
    ?.flatMap((m) => m.lessons)
    ?.find((l) => l.id === lesson.id);

  if (testLesson) {
    console.log("✅ Test lesson found in enrollment data");
    console.log("🎥 Video URL in enrollment:", testLesson.videoUrl);
  } else {
    console.log(
      "⚠️  Test lesson not found in enrollment (may be in different module)"
    );
  }
}

async function cleanupTestLesson(lessonId) {
  console.log("\n🧹 Cleaning up test lesson...");

  try {
    const response = await fetch(`${API_BASE}/lesson/${lessonId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.authToken}`,
      },
    });

    if (response.ok) {
      console.log("✅ Test lesson cleaned up successfully");
    } else {
      console.log(
        "⚠️  Could not clean up test lesson (may not have delete endpoint)"
      );
    }
  } catch (error) {
    console.log("⚠️  Cleanup failed:", error.message);
  }
}

async function runCompleteTest() {
  console.log("🚀 Starting Complete Video Flow Test\n");
  console.log("Configuration:");
  console.log("- API Base:", API_BASE);
  console.log("- Web Base:", WEB_BASE);
  console.log("- Module ID:", TEST_CONFIG.moduleId);
  console.log("- Enrollment ID:", TEST_CONFIG.enrollmentId);
  console.log("- Auth Token:", TEST_CONFIG.authToken ? "Provided" : "Missing");

  if (!TEST_CONFIG.authToken) {
    throw new Error(
      "No auth token provided. Set TEST_AUTH_TOKEN environment variable"
    );
  }

  let createdLesson = null;

  try {
    // Step 1: Create test video if needed
    await createTestVideo();

    // Step 2: Test video conversion
    await testVideoConversion();

    // Step 3: Test lesson creation
    createdLesson = await testLessonCreation();

    // Step 4: Test video proxy
    const proxyUrl = await testVideoProxy(createdLesson.videoUrl);

    // Step 5: Test video playback
    const playbackUrl = await testVideoPlayback(createdLesson);

    // Step 6: Test enrollment access
    await testEnrollmentVideoAccess(createdLesson);

    console.log("\n🎉 All tests passed successfully!");
    console.log("\n📋 Test Results Summary:");
    console.log("- ✅ Video conversion: Working");
    console.log("- ✅ Lesson creation: Working");
    console.log("- ✅ Video proxy: Working");
    console.log("- ✅ Video playback: Working");
    console.log("- ✅ Complete flow: Working");

    console.log("\n🔗 URLs for manual testing:");
    console.log("- Lesson ID:", createdLesson.id);
    console.log("- Video URL:", createdLesson.videoUrl);
    console.log("- Proxy URL:", `${WEB_BASE}${proxyUrl}`);
    console.log(
      "- Learning page:",
      `${WEB_BASE}/development/courses/${TEST_CONFIG.enrollmentId}/learn`
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    throw error;
  } finally {
    // Cleanup
    if (createdLesson) {
      await cleanupTestLesson(createdLesson.id);
    }
  }
}

// Run the test
if (require.main === module) {
  runCompleteTest().catch((error) => {
    console.error("💥 Test suite failed:", error.message);
    process.exit(1);
  });
}

module.exports = { runCompleteTest };
