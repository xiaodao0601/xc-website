// 用户认证路由
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JsonDatabase } = require('../config/database');
const config = require('../config');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const usersDb = new JsonDatabase('users');

// 用户登录
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '请输入用户名和密码' });
        }

        const user = usersDb.findOne({ username });
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = usersDb.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        const { password, ...userInfo } = user;
        res.json({ user: userInfo });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 修改密码
router.post('/change-password', authenticateToken, (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: '请填写完整信息' });
        }

        const user = usersDb.findById(req.user.id);
        
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(400).json({ error: '原密码错误' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        usersDb.update(req.user.id, { password: hashedPassword });

        res.json({ message: '密码修改成功' });
    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// ===== 管理员接口 =====

// 获取所有用户列表（仅管理员）
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = usersDb.findAll();
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json({ users: safeUsers });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建用户（仅管理员）
router.post('/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { username, password, nickname, role } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码必填' });
        }

        const existing = usersDb.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = usersDb.insert({
            username,
            password: hashedPassword,
            nickname: nickname || username,
            role: role || 'user'
        });
        
        delete newUser.password;
        res.json({ message: '用户创建成功', userId: newUser.id });
    } catch (error) {
        console.error('创建用户错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除用户（仅管理员）
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const idNum = parseInt(id);
        
        if (idNum === req.user.id) {
            return res.status(400).json({ error: '不能删除自己的账户' });
        }

        usersDb.delete(idNum);
        res.json({ message: '用户已删除' });
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router;