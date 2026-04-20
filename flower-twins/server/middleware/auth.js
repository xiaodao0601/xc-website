// JWT 认证中间件
const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: '请先登录' });
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '登录已过期，请重新登录' });
        }
        req.user = user;
        next();
    });
}

// 可选认证（不强制）
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, config.jwt.secret, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

// 管理员权限检查
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '权限不足' });
    }
    next();
}

module.exports = { authenticateToken, optionalAuth, requireAdmin };