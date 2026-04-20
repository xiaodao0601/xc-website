// 文件管理路由
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { JsonDatabase } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const config = require('../config');

const filesDb = new JsonDatabase('files');

// 获取文件列表（公开）
router.get('/', optionalAuth, (req, res) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        let files = filesDb.findAll();
        
        // 过滤分类
        if (category) {
            files = files.filter(f => f.category === category);
        }
        
        // 按时间倒序
        files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // 分页
        const total = files.length;
        const offset = (pageNum - 1) * limitNum;
        const paginatedFiles = files.slice(offset, offset + limitNum).map(f => ({
            ...f,
            url: `/api/files/download/${f.id}`
        }));
        
        res.json({
            files: paginatedFiles,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('获取文件列表错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取单个文件信息
router.get('/:id', (req, res) => {
    try {
        const file = filesDb.findById(parseInt(req.params.id));
        
        if (!file) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        res.json({
            ...file,
            url: `/api/files/download/${file.id}`
        });
    } catch (error) {
        console.error('获取文件信息错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 上传文件（需登录）
router.post('/', authenticateToken, (req, res) => {
    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: '请选择要上传的文件' });
        }
        
        try {
            const { category, description } = req.body;
            
            const newFile = filesDb.insert({
                filename: req.file.filename,
                original_name: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                user_id: req.user.id,
                category: category || 'other',
                description: description || '',
                downloads: 0
            });
            
            res.json({
                message: '文件上传成功',
                file: {
                    id: newFile.id,
                    filename: req.file.filename,
                    original_name: req.file.originalname,
                    size: req.file.size,
                    url: `/api/files/download/${newFile.id}`
                }
            });
        } catch (error) {
            console.error('保存文件信息错误:', error);
            // 删除已上传的文件
            fs.unlinkSync(req.file.path);
            res.status(500).json({ error: '服务器错误' });
        }
    });
});

// 下载文件
router.get('/download/:id', (req, res) => {
    try {
        const file = filesDb.findById(parseInt(req.params.id));
        
        if (!file) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        const filePath = path.resolve(__dirname, '..', file.path);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '文件已丢失' });
        }
        
        // 更新下载次数
        filesDb.update(file.id, { downloads: (file.downloads || 0) + 1 });
        
        // 设置响应头
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
        res.setHeader('Content-Type', file.mimetype);
        
        // 流式传输文件
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error) {
        console.error('下载文件错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新文件信息（需登录）
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { category, description } = req.body;
        
        const file = filesDb.findById(parseInt(id));
        
        if (!file) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        // 检查权限（仅上传者或管理员可修改）
        if (file.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: '权限不足' });
        }
        
        filesDb.update(parseInt(id), {
            category: category || file.category,
            description: description || file.description
        });
        
        res.json({ message: '文件信息已更新' });
    } catch (error) {
        console.error('更新文件错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除文件（需登录）
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const idNum = parseInt(id);
        
        const file = filesDb.findById(idNum);
        
        if (!file) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        // 检查权限（仅上传者或管理员可删除）
        if (file.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: '权限不足' });
        }
        
        // 删除物理文件
        const filePath = path.resolve(__dirname, '..', file.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // 删除数据库记录
        filesDb.delete(idNum);
        
        res.json({ message: '文件已删除' });
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router;