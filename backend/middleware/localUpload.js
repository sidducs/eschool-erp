const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Local Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Generate safe unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    const fileType = /jpeg|jpg|png|webp|pdf|doc|docx|ppt|pptx/;
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileType.test(file.mimetype) || file.mimetype === 'application/pdf'; // Explicit PDF check

    if (extname || mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format!"), false);
    }
};

const localUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: fileFilter,
});

module.exports = localUpload;
