const fs = require('fs');
const path = require('path');

// Create upload directories for course files
const uploadDirs = [
  'public/uploads/courses/thumbnails',
  'public/uploads/courses/videos'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory already exists: ${dir}`);
  }
});

console.log('🎉 Upload directories setup complete!');
