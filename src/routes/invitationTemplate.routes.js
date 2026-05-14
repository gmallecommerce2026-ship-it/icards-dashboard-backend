const express = require('express');
const router = express.Router();

// Gom chung import controller cho gọn
const invitationTemplateController = require('../controllers/invitationTemplate.controller');

// Import middleware upload
// (Lưu ý: Tuỳ cách bạn export bên trong upload.middleware.js mà dùng { upload } hoặc const upload = require(...))
const { upload } = require('../middleware/upload.middleware'); 

// ==========================================
// CÁC ROUTE KHÔNG YÊU CẦU ID (Nằm trên cùng)
// ==========================================
router.get('/', invitationTemplateController.getInvitationTemplates);
router.post('/seed', invitationTemplateController.seedTemplates);
router.post('/reorder', invitationTemplateController.reorderTemplates);
router.post('/bulk-import', upload.single('file'), invitationTemplateController.bulkCreateTemplates);

// [QUAN TRỌNG] ROUTE TẠO MỚI THIỆP
// Sử dụng upload.any() để phân tích FormData từ Frontend gửi lên
router.post('/', upload.any(), invitationTemplateController.createTemplate);


// ==========================================
// CÁC ROUTE CÓ CHỨA ID PARAMETER (/:id) (Nằm bên dưới)
// ==========================================
router.get('/:id', invitationTemplateController.getTemplateById);

// [QUAN TRỌNG] ROUTE CẬP NHẬT THIỆP
// Sử dụng upload.any() để phân tích FormData từ Frontend gửi lên
router.put('/:id', upload.any(), invitationTemplateController.updateTemplate);

// Bổ sung route Xoá thiệp (vì Frontend của bạn có tính năng xoá)
router.delete('/:id', invitationTemplateController.deleteTemplate);

router.post('/:id/view', invitationTemplateController.incrementView);

module.exports = router;