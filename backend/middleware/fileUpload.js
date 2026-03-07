const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);
        const isPdf = fileExt === 'pdf';

        if (isImage || isPdf) {
            return {
                folder: "eschool_erp",
                resource_type: "image",
                format: isPdf ? 'pdf' : undefined,
                public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now(),
                allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
            };
        } else {
            return {
                folder: "eschool_erp",
                resource_type: "raw",
                public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now() + "." + fileExt,
            };
        }
    },
});

// File Filter for Validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format!"), false);
    }
};

const fileUpload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
});

module.exports = fileUpload;
