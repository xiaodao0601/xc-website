// ===== 主页交互逻辑 =====

document.addEventListener('DOMContentLoaded', function() {
    initBackgroundBlur();
    initCarousel();
    initNavigation();
});

// 背景毛玻璃效果
function initBackgroundBlur() {
    const bgLayer = document.getElementById('bgLayer');
    if (bgLayer) {
        setTimeout(() => {
            bgLayer.classList.add('blur');
        }, 1000);
    }
}

// 轮播图
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // 创建导航点
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function nextSlide() {
        const nextIndex = (currentIndex + 1) % totalSlides;
        goToSlide(nextIndex);
    }
    
    // 自动播放 (3秒/张)
    setInterval(nextSlide, 3000);
}

// 页面导航
function initNavigation() {
    const filesBtn = document.getElementById('filesBtn');
    
    if (filesBtn) {
        filesBtn.addEventListener('click', function() {
            window.location.href = 'files.html';
        });
    }
}