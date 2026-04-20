// 数据库初始化 - 使用 JSON 文件存储
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('../config');

const dbDir = path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'database.json');

// 确保数据库目录存在
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 初始化数据库文件
function initDatabase() {
    let db = loadDb();
    
    // 如果数据库为空，初始化默认数据
    if (!db.users || db.users.length === 0) {
        const hashedPassword = bcrypt.hashSync(config.admin.password, 10);
        db.users = [{
            id: 1,
            username: config.admin.username,
            password: hashedPassword,
            nickname: '管理员',
            avatar: null,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }];
    }
    
    if (!db.files) {
        db.files = [];
    }
    
    if (!db.carousels || db.carousels.length === 0) {
        db.carousels = [
            { id: 1, image_url: 'https://pic1.imgdb.cn/pic/20250419/1727517619.jpg', title: '双生花', link: '', sort_order: 1, is_active: 1, created_at: new Date().toISOString() },
            { id: 2, image_url: 'https://picsum.photos/seed/flower2/800/400', title: '精彩瞬间', link: '', sort_order: 2, is_active: 1, created_at: new Date().toISOString() },
            { id: 3, image_url: 'https://picsum.photos/seed/flower3/800/400', title: '美好回忆', link: '', sort_order: 3, is_active: 1, created_at: new Date().toISOString() }
        ];
    }
    
    if (!db.settings) {
        db.settings = {
            site_title: '双生花',
            site_description: '双生花管理系统'
        };
    }
    
    saveDb(db);
    console.log('✅ 数据库初始化完成');
}

// 加载数据库
function loadDb() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('加载数据库失败:', e);
    }
    return { users: [], files: [], carousels: [], settings: {} };
}

// 保存数据库
function saveDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// 简单的数据库操作类
class JsonDatabase {
    constructor(table) {
        this.table = table;
    }
    
    load() {
        return loadDb();
    }
    
    save(data) {
        saveDb(data);
    }
    
    findAll() {
        const db = this.load();
        return db[this.table] || [];
    }
    
    findById(id) {
        const db = this.load();
        const arr = db[this.table] || [];
        return arr.find(item => item.id === id);
    }
    
    findOne(where) {
        const db = this.load();
        const arr = db[this.table] || [];
        return arr.find(item => {
            for (const key in where) {
                if (item[key] !== where[key]) return false;
            }
            return true;
        });
    }
    
    insert(data) {
        const db = this.load();
        const arr = db[this.table] || [];
        const id = arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
        const newItem = { ...data, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        arr.push(newItem);
        db[this.table] = arr;
        saveDb(db);
        return newItem;
    }
    
    update(id, data) {
        const db = this.load();
        const arr = db[this.table] || [];
        const index = arr.findIndex(item => item.id === id);
        if (index !== -1) {
            arr[index] = { ...arr[index], ...data, updated_at: new Date().toISOString() };
            db[this.table] = arr;
            saveDb(db);
            return arr[index];
        }
        return null;
    }
    
    delete(id) {
        const db = this.load();
        const arr = db[this.table] || [];
        const index = arr.findIndex(item => item.id === id);
        if (index !== -1) {
            arr.splice(index, 1);
            db[this.table] = arr;
            saveDb(db);
            return true;
        }
        return false;
    }
}

module.exports = { initDatabase, JsonDatabase };