// 文件上传中间件
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// 确保上传目录存在
const uploadDir = path.resolve(__dirname, '..', config.upload.dest);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

// 文件过滤器
function fileFilter(req, file, cb) {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
}

// 创建 multer 实例
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSize
    }
});

// 多文件上传
const uploadMultiple = upload.array('files', 10);

// 单文件上传
const uploadSingle = upload.single('file');

module.exports = { upload, uploadMultiple, uploadSingle };