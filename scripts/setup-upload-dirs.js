const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up upload directories...");

// Create temp chunks directory
const tempChunksDir = path.join(process.cwd(), "temp", "chunks");
if (!fs.existsSync(tempChunksDir)) {
  fs.mkdirSync(tempChunksDir, { recursive: true });
  console.log("✅ Created temp/chunks directory");
} else {
  console.log("✅ temp/chunks directory already exists");
}

// Create uploads directories
const uploadsDirs = [
  "public/uploads/courses/thumbnails",
  "public/uploads/courses/videos",
];

uploadsDirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created ${dir} directory`);
  } else {
    console.log(`✅ ${dir} directory already exists`);
  }
});

console.log("🎉 Upload directories setup complete!");
console.log("");
console.log("📁 Directory structure:");
console.log("├── temp/chunks/          (for chunked uploads)");
console.log("├── public/uploads/courses/thumbnails/");
console.log("└── public/uploads/courses/videos/");
console.log("");
console.log(
  "💡 You can now upload large files using the chunked upload system!"
);
