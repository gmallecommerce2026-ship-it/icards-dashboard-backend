const express = require('express');
const mediaController = require('../controllers/media.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware'); // Multer config bộ nhớ memoryStorage

const router = express.Router();

// Bắt buộc đăng nhập
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'designer', 'marketing'));

router.get('/', mediaController.getAllMedia);
router.post('/upload', uploadMiddleware.single('file'), mediaController.uploadMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;