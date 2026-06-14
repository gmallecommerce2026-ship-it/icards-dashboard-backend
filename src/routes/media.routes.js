const express = require('express');
const mediaController = require('../controllers/media.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware'); // Multer config bộ nhớ memoryStorage
const upload = uploadMiddleware.upload;
const router = express.Router();

// Bắt buộc đăng nhập
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin', 'designer', 'marketing'));

router.get('/', mediaController.getAllMedia);
router.post('/upload',
    authMiddleware.protect,
    authMiddleware.authorize('admin', 'designer', 'marketing'),
    upload.single('file'), // SỬA: dùng đúng instance .single() của thuộc tính 'upload'
    mediaController.uploadMedia
);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;