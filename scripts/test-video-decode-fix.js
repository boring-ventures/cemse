#!/usr/bin/env node

/**
 * Test script for video decode error fix
 * Tests the video validation and fix API
 */

const fetch = require("node-fetch");

const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

async function testVideoFix() {
  console.log("🧪 Testing Video Decode Error Fix\n");

  const testVideoUrl =
    "http://localhost:9000/course-videos/lesson-1756491279812-f3vpsr51rpj.mp4";
  const authToken = process.env.TEST_AUTH_TOKEN;

  if (!authToken) {
    console.log("⚠️  No TEST_AUTH_TOKEN environment variable set");
    console.log("   Please set it to test the authenticated API:");
    console.log("   export TEST_AUTH_TOKEN=your_jwt_token_here");
    return;
  }

  try {
    console.log("📋 Step 1: Testing video diagnostic API...");

    // Test diagnostic API
    const diagnosticResponse = await fetch(
      `${API_BASE}/video-diagnostic?url=${encodeURIComponent(testVideoUrl)}`
    );

    if (diagnosticResponse.ok) {
      const diagnostic = await diagnosticResponse.json();
      console.log("✅ Diagnostic API successful");
      console.log("   File:", diagnostic.fileName);
      console.log("   Format:", diagnostic.headerAnalysis.format);
      console.log("   Valid:", diagnostic.headerAnalysis.isValid);
      console.log("   Details:", diagnostic.headerAnalysis.details);
      console.log("   Recommendations:", diagnostic.recommendations.length);
    } else {
      console.log("❌ Diagnostic API failed:", diagnosticResponse.status);
      const error = await diagnosticResponse.text();
      console.log("   Error:", error);
    }

    console.log("\n🔧 Step 2: Testing video validation and fix API...");

    // Test fix API
    const fixResponse = await fetch(`${API_BASE}/video-validate-and-fix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ videoUrl: testVideoUrl }),
    });

    if (fixResponse.ok) {
      const fixResult = await fixResponse.json();
      console.log("✅ Video fix API successful");
      console.log("   Status:", fixResult.status);
      console.log("   Message:", fixResult.message);

      if (fixResult.fixedUrl) {
        console.log("   Fixed URL:", fixResult.fixedUrl);
        console.log("   Conversion Status:", fixResult.conversionStatus);
      }

      if (fixResult.analysis) {
        console.log("   Analysis:", fixResult.analysis.details);
      }
    } else {
      console.log("❌ Video fix API failed:", fixResponse.status);
      const error = await fixResponse.text();
      console.log("   Error:", error);
    }

    console.log("\n🎥 Step 3: Testing video proxy with original URL...");

    // Test proxy with original URL
    const proxyResponse = await fetch(
      `${API_BASE}/video-proxy?url=${encodeURIComponent(testVideoUrl)}`,
      { method: "HEAD" }
    );

    if (proxyResponse.ok) {
      console.log("✅ Video proxy accessible");
      console.log(
        "   Content-Type:",
        proxyResponse.headers.get("content-type")
      );
      console.log(
        "   Content-Length:",
        proxyResponse.headers.get("content-length")
      );
      console.log(
        "   Accept-Ranges:",
        proxyResponse.headers.get("accept-ranges")
      );
    } else {
      console.log("❌ Video proxy failed:", proxyResponse.status);
    }

    console.log("\n📊 Summary:");
    console.log("- The video decode error fix solution includes:");
    console.log(
      "  ✅ Enhanced video diagnostic API with better header analysis"
    );
    console.log("  ✅ Video validation and auto-fix API");
    console.log("  ✅ VideoPlayer component with automatic error recovery");
    console.log("  ✅ Manual 'Fix Video' button for user-initiated repairs");
    console.log(
      "  ✅ Improved FFmpeg conversion with maximum compatibility settings"
    );
    console.log("\n- When a PIPELINE_ERROR_DECODE occurs:");
    console.log("  1. VideoPlayer automatically attempts to fix the video");
    console.log("  2. If auto-fix succeeds, video reloads with fixed version");
    console.log("  3. If auto-fix fails, user sees 'Fix Video' button");
    console.log(
      "  4. Fixed videos use H.264 baseline profile for max compatibility"
    );
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

// Run test
if (require.main === module) {
  testVideoFix().catch((error) => {
    console.error("💥 Test script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { testVideoFix };
