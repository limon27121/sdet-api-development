import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// resolve from this file, not process.cwd(), so the server can be started from any folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// multer will not create the folder itself
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// mimetype comes from the client and can be faked, so the extension is what we
// actually write to disk and must be whitelisted independently
const ALLOWED = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        // photo-<userId>-<timestamp>.jpg -> unique, extension already validated
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `photo-${req.user?.id ?? "anon"}-${Date.now()}${ext}`)
    },
})

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed_exts = ALLOWED[file.mimetype]

    // both the declared type and the extension must be on the list, and agree
    if (!allowed_exts || !allowed_exts.includes(ext)) {
        return cb(new Error("only .jpg, .jpeg, .png or .webp images are allowed"))
    }

    cb(null, true)
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
})

// turns multer's thrown errors into a normal json response
export const handle_upload_error = (err, req, res, next) => {
    if (!err) return next()

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: err.code === "LIMIT_FILE_SIZE"
                ? "photo must be 2MB or smaller"
                : err.message
        })
    }

    return res.status(400).json({ message: err.message })
}
