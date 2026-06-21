// AdminBE/models/topic.model.js
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên chủ đề là bắt buộc.'],
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: [true, 'Đường dẫn (slug) là bắt buộc.'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        default: null // null nghĩa là danh mục gốc (Cấp 1)
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

topicSchema.pre('validate', function(next) {
    if (this.name && (!this.slug || this.slug.trim() === '')) {
        this.slug = this.name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
            .replace(/đ/g, "d").replace(/Đ/g, "D") // Xử lý chữ Đ
            .replace(/ /g, '-') // Đổi khoảng trắng thành dấu gạch ngang
            .replace(/[^\w-]+/g, ''); // Xóa các ký tự đặc biệt
    }
    next();
});

// 2. CHẠY TRƯỚC KHI LƯU VÀO DB (Tính toán số thứ tự)
topicSchema.pre('save', async function(next) {
    if (this.isNew) {
        const highestOrderTopic = await this.constructor.findOne({ parentId: this.parentId }).sort('-order');
        this.order = (highestOrderTopic && typeof highestOrderTopic.order === 'number') ? highestOrderTopic.order + 1 : 1;
    }
    next();
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;