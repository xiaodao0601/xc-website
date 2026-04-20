// ===== 文件柜页面交互逻辑 =====

document.addEventListener('DOMContentLoaded', function() {
    initFilesPage();
});

// 初始化文件柜页面
function initFilesPage() {
    initBackButton();
    initFileCards();
    initBackgroundBlur();
}

// 背景毛玻璃效果
function initBackgroundBlur() {
    const bgLayer = document.getElementById('bgLayer');
    if (bgLayer) {
        setTimeout(() => {
            bgLayer.classList.add('blur');
        }, 500);
    }
}

// 返回按钮
function initBackButton() {
    const backBtn = document.getElementById('backBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
}

// 文件卡片交互
function initFileCards() {
    const fileCards = document.querySelectorAll('.file-card');
    
    fileCards.forEach(card => {
        const downloadBtn = card.querySelector('.download-btn');
        const fileUrl = card.dataset.file;
        
        // 下载按钮点击
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fileUrl) {
                    downloadFile(fileUrl);
                }
            });
        }
        
        // 整个卡片点击也可以下载
        card.addEventListener('click', function() {
            if (fileUrl) {
                downloadFile(fileUrl);
            }
        });
    });
}

// 下载文件
function downloadFile(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}