const multer = require("multer");
const mimeTypes = require("mime-types");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
});

exports.fileUploadMiddleware = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ error: err.message, status: 400 });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: "An unknown error occurred.", status: 500 });
        }

        // Check if file exists
        if (!req.file) {
            // return res.status(400).json({ error: "No file uploaded.", status: 400 });
            req.url = "";
            next();
            return
        }

        // Check file type
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedFileTypes.includes(mimeTypes.lookup(req.file.originalname))) {
            // Delete the file if it's not the correct type
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Invalid file type." });
        }

        // If everything is fine, proceed to the next middleware/route handler
        req.url = req.file.path;
        next();
    });
};
