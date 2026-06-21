// AdminBE/services/topic.service.js
const Topic = require('../models/topic.model');
const PageCategory = require('../models/pageCategory.model');
const { Page } = require('../models/page.model');

// Hàm lấy dữ liệu và build thành cây
const getAllTopics = async () => {
    const topics = await Topic.find().sort('order').lean();
    
    // Thuật toán O(n) để build Tree
    const topicMap = {};
    const tree = [];

    // Khởi tạo map
    topics.forEach(topic => {
        topicMap[topic._id] = { ...topic, children: [] };
    });

    // Phân bổ vào cây
    topics.forEach(topic => {
        if (topic.parentId && topicMap[topic.parentId]) {
            topicMap[topic.parentId].children.push(topicMap[topic._id]);
        } else {
            tree.push(topicMap[topic._id]);
        }
    });

    return tree; // Trả về cấu trúc cây phân cấp
};

// Hàm lấy dữ liệu phẳng (phục vụ dropdown select hoặc map ID)
const getFlatTopics = () => Topic.find().sort('order');

const createTopic = (topicData) => Topic.create(topicData);

const updateTopic = (id, topicData) => Topic.findByIdAndUpdate(id, topicData, { new: true, runValidators: true });

const deleteTopic = async (id) => {
    // 1. Gỡ topic này ra khỏi tất cả các bài viết đang sử dụng
    await Page.updateMany({ topics: id }, { $pull: { topics: id } });
    
    // 2. Cập nhật các topic con thành cấp 1 (hoặc bạn có thể xoá luôn tuỳ logic nghiệp vụ)
    await Topic.updateMany({ parentId: id }, { parentId: null });

    return Topic.findByIdAndDelete(id);
};

const updateTopicOrder = (topics) => {
    // Cho phép update cả thứ tự và parentId khi kéo thả trên UI
    const promises = topics.map((topic, index) => {
        return Topic.findByIdAndUpdate(topic.id, { 
            order: index,
            parentId: topic.parentId || null
        });
    });
    return Promise.all(promises);
};

// HÀM MỚI: Seed dữ liệu từ PageCategory sang Topic
const seedFromCategories = async () => {
    const categories = await PageCategory.find().lean();
    let addedCount = 0;

    for (const cat of categories) {
        // Kiểm tra xem slug đã tồn tại chưa để tránh lỗi duplicate
        const existingTopic = await Topic.findOne({ slug: cat.slug });
        
        if (!existingTopic) {
            await Topic.create({
                name: cat.name,
                slug: cat.slug,
                order: cat.order,
                // Nếu PageCategory trong tương lai có parentId, nó cũng sẽ map sang đây.
                // Các Topic hiện tại đã có trong DB sẽ giữ nguyên ở cấp 1 (parentId: null)
                parentId: cat.parentId || null 
            });
            addedCount++;
        }
    }
    return addedCount;
};

module.exports = {
    getAllTopics,
    getFlatTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    updateTopicOrder,
    seedFromCategories // Export hàm seed
};