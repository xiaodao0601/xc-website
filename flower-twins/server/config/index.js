// 配置文件
const path = require('path');

// 全局模块路径加载器
function loadGlobalModule(name) {
    const globalPath = '/usr/local/lib/node_modules';
    try {
        return require(name);
    } catch (e) {
        return require(path.join(globalPath, name));
    }
}

// 动态加载 bcryptjs
let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (e) {
    bcrypt = require(path.join('/usr/local/lib/node_modules', 'bcryptjs'));
}

module.exports = {
    port: process.env.PORT || 3000,
    
    // 数据库配置
    db: {
        path: './data/flower-twins.json'
    },
    
    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || 'flower-twins-secret-key-2024',
        expiresIn: '7d'
    },
    
    // 文件上传配置
    upload: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain', 'application/zip'],
        dest: './uploads/'
    },
    
    // 管理员账户（首次启动自动创建）
    admin: {
        username: 'admin',
        password: 'flower2024' // 首次启动后请修改！
    },
    
    // 导出的模块（供其他模块使用）
    bcrypt
};