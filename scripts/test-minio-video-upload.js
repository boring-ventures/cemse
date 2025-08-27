const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'https://cemse-back-production-56da.up.railway.app';
const AUTH_TOKEN = 'your-auth-token-here'; // Replace with actual token

// Test video file path (create a small test video or use existing one)
const TEST_VIDEO_PATH = './test-video.mp4';
const TEST_THUMBNAIL_PATH = './test-thumbnail.jpg';
const TEST_DOCUMENT_PATH = './test-document.pdf';

async function testVideoUpload() {
  console.log('🎬 Testing MinIO Video Upload System...\n');

  try {
    // Test 1: Upload single video
    console.log('📹 Test 1: Upload single video');
    await testSingleVideoUpload();
    console.log('✅ Single video upload test passed\n');

    // Test 2: Upload multiple files
    console.log('📁 Test 2: Upload multiple files');
    await testMultipleFilesUpload();
    console.log('✅ Multiple files upload test passed\n');

    // Test 3: Test error handling
    console.log('⚠️ Test 3: Error handling');
    await testErrorHandling();
    console.log('✅ Error handling test passed\n');

    console.log('🎉 All tests passed! MinIO video upload system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testSingleVideoUpload() {
  const formData = new FormData();

  // Add lesson data
  formData.append('title', 'Test Video Lesson');
  formData.append('description', 'This is a test video lesson');
  formData.append('content', 'Test content for the lesson');
  formData.append('moduleId', 'test-module-id');
  formData.append('contentType', 'VIDEO');
  formData.append('duration', '120');
  formData.append('orderIndex', '1');
  formData.append('isRequired', 'true');
  formData.append('isPreview', 'false');

  // Add video file if exists
  if (fs.existsSync(TEST_VIDEO_PATH)) {
    formData.append('video', fs.createReadStream(TEST_VIDEO_PATH));
  } else {
    // Create a dummy file for testing
    const dummyVideo = Buffer.from('dummy video content');
    formData.append('video', dummyVideo, { filename: 'test-video.mp4', contentType: 'video/mp4' });
  }

  const response = await fetch(`${API_BASE_URL}/api/lesson/with-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Single video upload failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('   📤 Uploaded video URL:', result.videoUrl);
  console.log('   📋 Lesson ID:', result.id);
}

async function testMultipleFilesUpload() {
  const formData = new FormData();

  // Add lesson data
  formData.append('title', 'Test Multiple Files Lesson');
  formData.append('description', 'This is a test lesson with multiple files');
  formData.append('content', 'Test content for the lesson');
  formData.append('moduleId', 'test-module-id');
  formData.append('contentType', 'VIDEO');
  formData.append('duration', '180');
  formData.append('orderIndex', '2');
  formData.append('isRequired', 'true');
  formData.append('isPreview', 'false');

  // Add video file
  if (fs.existsSync(TEST_VIDEO_PATH)) {
    formData.append('video', fs.createReadStream(TEST_VIDEO_PATH));
  } else {
    const dummyVideo = Buffer.from('dummy video content');
    formData.append('video', dummyVideo, { filename: 'test-video.mp4', contentType: 'video/mp4' });
  }

  // Add thumbnail if exists
  if (fs.existsSync(TEST_THUMBNAIL_PATH)) {
    formData.append('thumbnail', fs.createReadStream(TEST_THUMBNAIL_PATH));
  } else {
    const dummyThumbnail = Buffer.from('dummy thumbnail content');
    formData.append('thumbnail', dummyThumbnail, { filename: 'test-thumbnail.jpg', contentType: 'image/jpeg' });
  }

  // Add document if exists
  if (fs.existsSync(TEST_DOCUMENT_PATH)) {
    formData.append('attachments', fs.createReadStream(TEST_DOCUMENT_PATH));
  } else {
    const dummyDocument = Buffer.from('dummy document content');
    formData.append('attachments', dummyDocument, { filename: 'test-document.pdf', contentType: 'application/pdf' });
  }

  const response = await fetch(`${API_BASE_URL}/api/lesson/with-files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Multiple files upload failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('   📤 Uploaded video URL:', result.videoUrl);
  console.log('   🖼️ Uploaded thumbnail URL:', result.thumbnailUrl);
  console.log('   📎 Uploaded attachments:', result.attachments?.length || 0);
  console.log('   📋 Lesson ID:', result.id);
}

async function testErrorHandling() {
  const formData = new FormData();

  // Test without required video file
  formData.append('title', 'Test Error Lesson');
  formData.append('description', 'This should fail');
  formData.append('content', 'Test content');
  formData.append('moduleId', 'test-module-id');
  formData.append('contentType', 'VIDEO');
  formData.append('duration', '120');
  formData.append('orderIndex', '1');
  formData.append('isRequired', 'true');
  formData.append('isPreview', 'false');
  // Intentionally not adding video file

  const response = await fetch(`${API_BASE_URL}/api/lesson/with-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: formData,
  });

  if (response.ok) {
    throw new Error('Error handling test failed: Should have returned an error for missing video');
  }

  const error = await response.json();
  console.log('   ✅ Correctly handled missing video error:', error.error);
}

// Helper function to create test files
function createTestFiles() {
  console.log('📝 Creating test files...');

  // Create dummy video file
  if (!fs.existsSync(TEST_VIDEO_PATH)) {
    const dummyVideo = Buffer.from('dummy video content for testing');
    fs.writeFileSync(TEST_VIDEO_PATH, dummyVideo);
    console.log('   ✅ Created test video file');
  }

  // Create dummy thumbnail file
  if (!fs.existsSync(TEST_THUMBNAIL_PATH)) {
    const dummyThumbnail = Buffer.from('dummy thumbnail content for testing');
    fs.writeFileSync(TEST_THUMBNAIL_PATH, dummyThumbnail);
    console.log('   ✅ Created test thumbnail file');
  }

  // Create dummy document file
  if (!fs.existsSync(TEST_DOCUMENT_PATH)) {
    const dummyDocument = Buffer.from('dummy document content for testing');
    fs.writeFileSync(TEST_DOCUMENT_PATH, dummyDocument);
    console.log('   ✅ Created test document file');
  }
}

// Main execution
async function main() {
  console.log('🚀 MinIO Video Upload Test Script\n');

  // Check if API is running
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
    if (!healthCheck.ok) {
      console.log('⚠️ Warning: API health check failed. Make sure your Next.js app is running on port 3000.');
    }
  } catch (error) {
    console.log('⚠️ Warning: Could not connect to API. Make sure your Next.js app is running on port 3000.');
  }

  // Create test files
  createTestFiles();

  // Run tests
  await testVideoUpload();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testVideoUpload,
  testSingleVideoUpload,
  testMultipleFilesUpload,
  testErrorHandling,
};
