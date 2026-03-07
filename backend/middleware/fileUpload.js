const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {

        const fileExt = file.originalname.split(".").pop().toLowerCase();

        const imageTypes = ["jpg", "jpeg", "png", "webp"];
        const isImage = imageTypes.includes(fileExt);

        return {
            folder: "eschool_erp",
            resource_type: "auto", // Let Cloudinary handle the type
            public_id:
                file.originalname
                    .split(".")[0]
                    .replace(/[^a-zA-Z0-9]/g, "_") +
                "_" +
                Date.now(),
            format: fileExt // Force the format extension
        };
    },
});

// File validation
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "jpeg", "jpg", "png", "webp",
        "pdf", "doc", "docx",
        "ppt", "pptx",
        "xls", "xlsx",
        "txt"
    ];

    const fileExt = file.originalname.split(".").pop().toLowerCase();

    if (allowedTypes.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }

};

const fileUpload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
});

module.exports = fileUpload;