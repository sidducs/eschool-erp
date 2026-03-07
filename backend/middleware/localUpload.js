const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Disk storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname);

        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

// File filter
const fileFilter = (req, file, cb) => {

    const allowedTypes =
        /jpeg|jpg|png|webp|pdf|doc|docx|ppt|pptx|xls|xlsx/;

    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimetype =
        allowedTypes.test(file.mimetype) ||
        file.mimetype === "application/pdf";

    if (extname || mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }
};

const localUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilter,
});

module.exports = localUpload;