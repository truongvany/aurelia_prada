const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads', 'tryon');
const inputDir = path.join(uploadsRoot, 'inputs');
const resultDir = path.join(uploadsRoot, 'results');

function ensureTryOnDirs() {
  [uploadsRoot, inputDir, resultDir].forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

ensureTryOnDirs();

const maxFileSizeMb = Math.max(1, Number(process.env.TRYON_MAX_FILE_SIZE_MB || 15));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, inputDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const safeBase = path
      .basename(file.originalname || 'try-on-image', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 80);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const mime = String(file.mimetype || '').toLowerCase();
  const garmentAllowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const modelAllowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.fieldname === 'garmentImage') {
    if (garmentAllowed.includes(mime)) {
      cb(null, true);
      return;
    }
    cb(new Error('Anh ao chi ho tro JPG/PNG/WEBP.'), false);
    return;
  }

  if (file.fieldname === 'modelImage') {
    if (modelAllowed.includes(mime)) {
      cb(null, true);
      return;
    }
    cb(new Error('Anh nguoi mau chi ho tro JPG/PNG/WEBP.'), false);
    return;
  }

  cb(new Error('Truong tep khong hop le.'), false);
};

const tryOnUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: 2,
  },
});

const tryOnUploadFields = tryOnUpload.fields([
  { name: 'garmentImage', maxCount: 1 },
  { name: 'modelImage', maxCount: 1 },
]);

function handleTryOnUpload(req, res, next) {
  tryOnUploadFields(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          message: `Kich thuoc anh qua lon. Moi anh toi da ${maxFileSizeMb}MB.`,
        });
        return;
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({ message: 'Chi duoc upload toi da 2 anh.' });
        return;
      }

      res.status(400).json({ message: error.message || 'Upload anh khong hop le.' });
      return;
    }

    res.status(400).json({ message: error.message || 'Upload anh khong hop le.' });
  });
}

module.exports = {
  tryOnUpload,
  handleTryOnUpload,
  ensureTryOnDirs,
  tryOnPaths: {
    uploadsRoot,
    inputDir,
    resultDir,
  },
  tryOnUploadConfig: {
    maxFileSizeMb,
  },
};
