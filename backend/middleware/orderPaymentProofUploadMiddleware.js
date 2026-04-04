const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'payment-proofs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const maxFileSizeMb = Math.max(1, Number(process.env.PAYMENT_PROOF_MAX_FILE_SIZE_MB || 8));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeBase = path
      .basename(file.originalname || 'payment-proof', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 80);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const mime = String(file.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Chi chap nhan anh chung minh thanh toan.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
});

const paymentProofSingle = upload.single('paymentProof');

function handlePaymentProofUpload(req, res, next) {
  paymentProofSingle(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          message: `Anh qua lon. Moi anh toi da ${maxFileSizeMb}MB.`,
        });
        return;
      }

      res.status(400).json({ message: error.message || 'Upload anh khong hop le.' });
      return;
    }

    res.status(400).json({ message: error.message || 'Upload anh khong hop le.' });
  });
}

module.exports = {
  handlePaymentProofUpload,
};
