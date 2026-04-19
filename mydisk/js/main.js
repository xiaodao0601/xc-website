// 主逻辑脚本

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initAnimations();
});

// 加载配置
function loadConfig() {
    try {
        const config = siteConfig;
        
        // 个人简介
        document.getElementById('avatar').src = config.profile.avatar;
        document.getElementById('name').textContent = config.profile.name;
        document.getElementById('bio').textContent = config.profile.bio;
        
        // 社交链接
        const githubLink = document.getElementById('github-link');
        githubLink.href = config.profile.github;
        
        const emailLink = document.getElementById('email-link');
        emailLink.href = `mailto:${config.profile.email}`;
        
        // 网站简介
        document.getElementById('site-desc').textContent = config.siteInfo.description;
        
        // 页脚
        document.getElementById('footer-name').textContent = config.profile.name;
        
        // 页面标题
        document.title = config.siteInfo.title;
        
        // 加载文件夹
        loadFolders(config.folders);
        
    } catch (error) {
        console.error('加载配置失败:', error);
    }
}

// 加载文件夹
function loadFolders(folders) {
    const container = document.getElementById('folders-container');
    
    folders.forEach((folder, index) => {
        const folderCard = document.createElement('div');
        folderCard.className = 'folder-card';
        
        const filesHTML = folder.files.map(file => `
            <li class="file-item">
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.size}</span>
                </div>
                <a href="${file.url}" class="download-btn" download>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    下载
                </a>
            </li>
        `).join('');
        
        folderCard.innerHTML = `
            <div class="folder-header" onclick="toggleFolder(this)">
                <span class="folder-name">${folder.name}</span>
                <span class="folder-toggle">▼</span>
            </div>
            <div class="folder-description">${folder.description}</div>
            <div class="folder-files">
                <ul class="file-list">
                    ${filesHTML}
                </ul>
            </div>
        `;
        
        container.appendChild(folderCard);
    });
}

// 切换文件夹展开/收起
function toggleFolder(header) {
    const card = header.parentElement;
    card.classList.toggle('expanded');
}

// 初始化动画
function initAnimations() {
    // 页面加载动画
    const cards = document.querySelectorAll('.profile-card, .site-intro, .folder-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 浮动元素动画
    const floatElements = document.querySelectorAll('.floating-element');
    floatElements.forEach((el, index) => {
        el.style.animationDelay = `${index * -2}s`;
    });
}