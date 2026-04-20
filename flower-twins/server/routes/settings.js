// 站点配置路由
const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const settingsDb = new JsonDatabase('settings');

// 获取所有配置（公开）
router.get('/', (req, res) => {
    try {
        const db = settingsDb.load();
        res.json({ settings: db.settings || {} });
    } catch (error) {
        console.error('获取配置错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新配置（仅管理员）
router.put('/', authenticateToken, requireAdmin, (req, res) => {
    try {
        const updates = req.body;
        const db = settingsDb.load();
        
        db.settings = { ...db.settings, ...updates };
        settingsDb.save(db);
        
        res.json({ message: '配置已更新' });
    } catch (error) {
        console.error('更新配置错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取单个配置
router.get('/:key', (req, res) => {
    try {
        const db = settingsDb.load();
        const value = db.settings ? db.settings[req.params.key] : null;
        res.json({ key: req.params.key, value });
    } catch (error) {
        console.error('获取配置错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router;