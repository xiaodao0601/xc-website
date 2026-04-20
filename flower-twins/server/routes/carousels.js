// 轮播图管理路由
const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const carouselsDb = new JsonDatabase('carousels');

// 获取轮播图列表（公开）
router.get('/', (req, res) => {
    try {
        let carousels = carouselsDb.findAll();
        // 只返回启用的，按 sort_order 排序
        carousels = carousels.filter(c => c.is_active === 1 || c.is_active === true);
        carousels.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        
        res.json({ carousels });
    } catch (error) {
        console.error('获取轮播图错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取所有轮播图（包括禁用的，仅管理员）
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
    try {
        let carousels = carouselsDb.findAll();
        carousels.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        res.json({ carousels });
    } catch (error) {
        console.error('获取轮播图错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 添加轮播图（仅管理员）
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { image_url, title, link, sort_order } = req.body;
        
        if (!image_url) {
            return res.status(400).json({ error: '图片URL不能为空' });
        }
        
        const all = carouselsDb.findAll();
        const maxOrder = all.length > 0 ? Math.max(...all.map(c => c.sort_order || 0)) : 0;
        const order = sort_order || maxOrder + 1;
        
        const newCarousel = carouselsDb.insert({
            image_url,
            title: title || '',
            link: link || '',
            sort_order: order,
            is_active: 1
        });
        
        res.json({
            message: '轮播图添加成功',
            carousel: newCarousel
        });
    } catch (error) {
        console.error('添加轮播图错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新轮播图（仅管理员）
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const idNum = parseInt(id);
        const { image_url, title, link, sort_order, is_active } = req.body;
        
        const carousel = carouselsDb.findById(idNum);
        
        if (!carousel) {
            return res.status(404).json({ error: '轮播图不存在' });
        }
        
        carouselsDb.update(idNum, {
            image_url: image_url || carousel.image_url,
            title: title !== undefined ? title : carousel.title,
            link: link !== undefined ? link : carousel.link,
            sort_order: sort_order || carousel.sort_order,
            is_active: is_active !== undefined ? is_active : carousel.is_active
        });
        
        res.json({ message: '轮播图已更新' });
    } catch (error) {
        console.error('更新轮播图错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除轮播图（仅管理员）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        
        carouselsDb.delete(parseInt(id));
        
        res.json({ message: '轮播图已删除' });
    } catch (error) {
        console.error('删除轮播图错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router;