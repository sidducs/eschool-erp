
const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        res.json({ url: req.file.path, public_id: req.file.filename });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadFile
};
