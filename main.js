const fs = require("fs");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYJMrY5BnKHkL7_nWzK8L32J1eviyxe7k",
  authDomain: "ai-photo-prompts.firebaseapp.com",
  databaseURL: "https://ai-photo-prompts-default-rtdb.firebaseio.com",
  projectId: "ai-photo-prompts",
  storageBucket: "ai-photo-prompts.appspot.com",
  messagingSenderId: "600509719161",
  appId: "1:600509719161:web:134ac00db65cf42c28eaa8",
  measurementId: "G-TZPFPTJNF6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ Supported image/video file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
const MAX_RESULTS = 500;

// ✅ Function: Recursively scan directory
function scanForMediaAndFolders(baseDir = "D:\\") {
  const results = [];

  function walk(dir) {
    if (results.length >= MAX_RESULTS) return;

    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return; // skip folders that can't be read
    }

    for (const entry of entries) {
      if (results.length >= MAX_RESULTS) return;

      const fullPath = path.join(dir, entry);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        results.push(fullPath); // Include folder
        walk(fullPath); // Recurse into folder
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext)) {
          results.push(fullPath); // Only media files
        }
      }
    }
  }

  walk(baseDir);
  return results;
}

// ✅ Upload scanned list to Firebase
function uploadToFirebase(list) {
  const targetRef = ref(database, "scannedFiles");

  set(targetRef, list)
    .then(() => {
      console.log("✅ Uploaded media files & folders list to Firebase.");
    })
    .catch((err) => {
      console.error("❌ Upload failed:", err.message);
    });
}

// ✅ Run scanning and upload
function run() {
  console.log("📁 Scanning D:\\ for media files and folders...");
  const results = scanForMediaAndFolders("D:\\");
  console.log(`📦 Total items found: ${results.length}`);
  uploadToFirebase(results);
}

// Start
run();
