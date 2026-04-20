/**
 * 双生花管理系统 - 静态服务器（无后端依赖版本）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME 类型
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// 模拟数据
const mockData = {
    carousels: [
        { id: 1, image_url: 'https://picsum.photos/seed/flower1/1200/500', title: '双生花', link: '' },
        { id: 2, image_url: 'https://picsum.photos/seed/flower2/1200/500', title: '精彩瞬间', link: '' },
        { id: 3, image_url: 'https://picsum.photos/seed/flower3/1200/500', title: '美好回忆', link: '' }
    ],
    settings: {
        site_title: '双生花',
        site_description: '记录我们的点点滴滴'
    }
};

// API 路由处理
function handleApi(req, res, pathname) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 轮播图 API
    if (pathname === '/api/carousels') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ carousels: mockData.carousels }));
        return;
    }
    
    // 设置 API
    if (pathname === '/api/settings') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ settings: mockData.settings }));
        return;
    }
    
    // 登录 API (模拟)
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                if (username === 'admin' && password === 'flower2024') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        message: '登录成功',
                        token: 'mock-jwt-token-' + Date.now(),
                        user: { id: 1, username: 'admin', nickname: '管理员', role: 'admin' }
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '用户名或密码错误' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '请求格式错误' }));
            }
        });
        return;
    }
    
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API不存在' }));
}

// 主请求处理
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // API 请求
    if (pathname.startsWith('/api/')) {
        handleApi(req, res, pathname);
        return;
    }
    
    // 默认首页
    let filePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    filePath = path.join(__dirname, '..', filePath);
    
    // 安全检查：防止目录遍历
    if (!filePath.startsWith(__dirname.replace('/server', ''))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在，返回 index.html（支持 SPA）
                fs.readFile(path.resolve(__dirname, '..', 'index.html'), (err2, data2) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end('Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data2);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// 启动服务器
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
    console.log(`🌸 双生花网站已启动: http://localhost:${PORT}`);
    console.log(`📱 访问首页查看效果`);
    console.log(`🔐 测试账号: admin / flower2024`);
});

module.exports = server;