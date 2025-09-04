// Test script to verify chunk upload functionality
const testChunkUpload = async () => {
  try {
    console.log("🧪 Testing chunk upload with different sizes...");

    // Create a test file (1MB)
    const testData = new Uint8Array(1024 * 1024); // 1MB
    for (let i = 0; i < testData.length; i++) {
      testData[i] = Math.floor(Math.random() * 256);
    }

    const testFile = new File([testData], "test-video.mp4", {
      type: "video/mp4",
    });
    console.log(
      `📁 Created test file: ${testFile.name} (${(testFile.size / 1024).toFixed(0)} KB)`
    );

    // Test different chunk sizes
    const chunkSizes = [256 * 1024, 128 * 1024, 64 * 1024, 32 * 1024]; // 256KB, 128KB, 64KB, 32KB

    for (const chunkSize of chunkSizes) {
      console.log(
        `\n🔍 Testing chunk size: ${(chunkSize / 1024).toFixed(0)} KB`
      );

      const chunks = [];
      let start = 0;

      while (start < testFile.size) {
        const end = Math.min(start + chunkSize, testFile.size);
        chunks.push(testFile.slice(start, end));
        start = end;
      }

      console.log(`📦 Split into ${chunks.length} chunks`);

      // Test uploading the first chunk
      const firstChunk = chunks[0];
      const formData = new FormData();
      formData.append("chunk", firstChunk);
      formData.append("chunkNumber", "1");
      formData.append("totalChunks", chunks.length.toString());
      formData.append("sessionId", `test-${Date.now()}`);
      formData.append("fileName", testFile.name);
      formData.append("fileType", "videoPreview");
      formData.append("fileSize", testFile.size.toString());
      formData.append("mimeType", testFile.type);

      try {
        const response = await fetch(
          "http://cemse.boring.lat/api/files/upload/chunk",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (response.ok) {
          console.log(
            `✅ Chunk size ${(chunkSize / 1024).toFixed(0)} KB works!`
          );
          const result = await response.json();
          console.log("Response:", result);
          break; // Found working chunk size
        } else {
          console.log(
            `❌ Chunk size ${(chunkSize / 1024).toFixed(0)} KB failed: ${response.status} ${response.statusText}`
          );
          const errorText = await response.text();
          console.log("Error:", errorText);
        }
      } catch (error) {
        console.log(
          `❌ Chunk size ${(chunkSize / 1024).toFixed(0)} KB failed:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testChunkUpload();
