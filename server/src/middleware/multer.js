import multer, { MulterError } from "multer";

const storage = multer.memoryStorage();
export const singleUpload = multer({ storage }).single("file");

// Dedicated uploader for proctoring webcam frames. Kept separate from `singleUpload`
// because these endpoints are PUBLIC (gated only by an unguessable id/token), so we
// enforce a small size limit, a single file, and an image-only content type.
const screenshotMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024, files: 1 }, // ~300 KB is plenty for a 640px JPEG frame
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new MulterError("LIMIT_UNEXPECTED_FILE", "file"));
    }
  },
}).single("file");

// Wrap the multer middleware so its errors return a clean 4xx instead of bubbling to
// the generic 500 handler. Runs before the controller, so this is the only place we
// can translate MulterError codes.
export const screenshotUpload = (req, res, next) => {
  screenshotMulter(req, res, (err) => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Screenshot too large" });
      }
      return res.status(400).json({ message: "Invalid screenshot upload" });
    }
    if (err) {
      return res.status(400).json({ message: "Upload failed" });
    }
    next();
  });
};
