/* ========================================
   陈总的小窝 - App主逻辑
   ======================================== */

class App {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'shen';
    this.currentCategory = 'all';
    this.files = [];
    this.longPressTimer = null;
    this.selectedFile = null;
    
    this.init();
  }

  async init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.bindElements();
    this.initTheme();
    this.initParticles();
    this.loadFiles();
    this.bindEvents();
    this.initPWA();
    this.hideSplash();
  }

  bindElements() {
    this.splashScreen = document.getElementById('splash-screen');
    this.themeToggle = document.getElementById('themeToggle');
    this.fileList = document.getElementById('fileList');
    this.contextMenu = document.getElementById('contextMenu');
    this.downloadModal = document.getElementById('downloadModal');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.themeOverlay = document.getElementById('theme-transition-overlay');
    this.particleCanvas = document.getElementById('particle-canvas');
    this.categoryBtns = document.querySelectorAll('.category-btn');
    this.navBtns = document.querySelectorAll('.nav-btn');
  }

  // ===== 主题系统 =====
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeIcon();
    
    if (this.currentTheme === 'xiaoyu') {
      document.querySelector('.theme-icon').textContent = '🌸';
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'shen' ? 'xiaoyu' : 'shen';
    
    // 主题切换动画
    this.themeOverlay.classList.add('active');
    
    setTimeout(() => {
      this.currentTheme = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      this.updateThemeIcon();
      this.themeOverlay.classList.remove('active');
      
      // 更新粒子颜色
      this.particleColor = newTheme === 'shen' ? '#D4A574' : '#FF80AB';
    }, 500);
  }

  updateThemeIcon() {
    const icon = this.themeToggle.querySelector('.theme-icon');
    if (this.currentTheme === 'shen') {
      icon.textContent = '🌸'; // 萧容鱼mode
    } else {
      icon.textContent = '🌿'; // 沈幼楚mode
    }
  }

  // ===== 粒子背景 =====
  initParticles() {
    const canvas = this.particleCanvas;
    const ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleColor = this.currentTheme === 'shen' ? '#D4A574' : '#FF80AB';
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 创建粒子
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        // 边界检测
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = this.particleColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  // ===== 文件系统 =====
  async loadFiles() {
    // 模拟文件数据 - 实际项目中从后端API获取
    this.files = [
      { id: 1, name: 'Photoshop 2024', size: '2.4 GB', category: 'software', icon: '🎨' },
      { id: 2, name: 'VSCode 最新版', size: '89 MB', category: 'software', icon: '💻' },
      { id: 3, name: '原神 v4.2', size: '18.5 GB', category: 'game', icon: '🎮' },
      { id: 4, name: '崩坏星穹铁道', size: '12.3 GB', category: 'game', icon: '⚡' },
      { id: 5, name: 'Python入门教程', size: '25 MB', category: 'document', icon: '📚' },
      { id: 6, name: 'AI提示词大全', size: '5.2 MB', category: 'document', icon: '🤖' },
      { id: 7, name: '4K壁纸包', size: '1.8 GB', category: 'other', icon: '🖼️' },
      { id: 8, name: 'Notion模板', size: '12 MB', category: 'other', icon: '📝' },
    ];
    
    this.renderFiles();
  }

  renderFiles() {
    const filtered = this.currentCategory === 'all' 
      ? this.files 
      : this.files.filter(f => f.category === this.currentCategory);
    
    // FLIP动画
    const oldCards = this.fileList.querySelectorAll('.file-card');
    oldCards.forEach(card => card.classList.add('flip-out'));
    
    setTimeout(() => {
      this.fileList.innerHTML = '';
      
      filtered.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.id = file.id;
        card.innerHTML = `
          <div class="file-icon">${file.icon}</div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${file.size}</div>
        `;
        
        // 点击下载
        card.addEventListener('click', () => this.downloadFile(file));
        
        // 长按显示菜单
        card.addEventListener('contextmenu', (e) => this.showContextMenu(e, file));
        
        this.fileList.appendChild(card);
        
        // 交错动画
        setTimeout(() => {
          card.classList.add('flip-in');
        }, index * 50);
      });
    }, 150);
  }

  downloadFile(file) {
    this.selectedFile = file;
    this.downloadModal.classList.add('visible');
    
    // 模拟下载进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          this.downloadModal.classList.remove('visible');
          this.progressFill.style.width = '0%';
          this.progressText.textContent = '0%';
          
          // 模拟实际下载
          this.showToast(`开始下载: ${file.name}`);
        }, 500);
      }
      
      this.progressFill.style.width = progress + '%';
      this.progressText.textContent = Math.round(progress) + '%';
    }, 200);
    
    // 触感反馈
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // ===== 上下文菜单 =====
  showContextMenu(e, file) {
    e.preventDefault();
    this.selectedFile = file;
    
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    
    this.contextMenu.style.left = x + 'px';
    this.contextMenu.style.top = y + 'px';
    this.contextMenu.classList.add('visible');
    
    // 点击其他地方关闭
    const closeMenu = (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.contextMenu.classList.remove('visible');
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  // ===== 分类切换 =====
  switchCategory(category) {
    this.currentCategory = category;
    
    this.categoryBtns.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    this.renderFiles();
    
    // 触感反馈
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  // ===== 页面切换 =====
  switchPage(page) {
    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    // 这里可以扩展不同页面的内容
    if (page === 'settings') {
      this.showToast('设置页面开发中...');
    }
  }

  // ===== PWA =====
  initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
    }
  }

  // ===== 启动画面 =====
  hideSplash() {
    setTimeout(() => {
      this.splashScreen.classList.add('hidden');
    }, 1500);
  }

  // ===== 提示消息 =====
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      color: var(--text-primary);
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px var(--shadow-strong);
      z-index: 10003;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ===== 事件绑定 =====
  bindEvents() {
    // 主题切换
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // 分类按钮
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchCategory(btn.dataset.category);
      });
    });
    
    // 底部导航
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchPage(btn.dataset.page);
      });
    });
    
    // 上下文菜单操作
    this.contextMenu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleMenuAction(action);
        this.contextMenu.classList.remove('visible');
      });
    });
  }

  handleMenuAction(action) {
    if (!this.selectedFile) return;
    
    switch (action) {
      case 'download':
        this.downloadFile(this.selectedFile);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: this.selectedFile.name,
            text: '分享文件: ' + this.selectedFile.name
          });
        }
        break;
      case 'info':
        this.showToast(`文件: ${this.selectedFile.name}\n大小: ${this.selectedFile.size}`);
        break;
    }
  }
}

// ===== 轮播图 =====
  initCarousel() {
    // 默认轮播图数据
    this.carouselImages = [
      { id: 1, url: 'https://picsum.photos/400/533?random=1', alt: '轮播图1' },
      { id: 2, url: 'https://picsum.photos/400/533?random=2', alt: '轮播图2' },
      { id: 3, url: 'https://picsum.photos/400/533?random=3', alt: '轮播图3' },
      { id: 4, url: 'https://picsum.photos/400/533?random=4', alt: '轮播图4' },
    ];
    
    this.currentSlide = 0;
    this.carouselWrapper = document.getElementById('carouselWrapper');
    this.carouselInterval = null;
    this.isTouching = false;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    
    this.renderCarousel();
    this.bindCarouselEvents();
    this.startAutoPlay();
  }

  renderCarousel() {
    if (!this.carouselWrapper) return;
    
    this.carouselWrapper.innerHTML = '';
    
    // 渲染所有幻灯片（包含复制的头尾实现无限循环）
    const allSlides = [
      ...this.carouselImages,
      ...this.carouselImages,
      ...this.carouselImages
    ];
    
    allSlides.forEach((img, index) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `<img src="${img.url}" alt="${img.alt}" loading="lazy">`;
      this.carouselWrapper.appendChild(slide);
    });
    
    this.updateCarouselPosition();
  }

  bindCarouselEvents() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    
    // 触摸开始 - 暂停自动播放
    carousel.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.startX = e.touches[0].clientX;
      this.currentX = this.startX;
      this.pauseAutoPlay();
    }, { passive: true });
    
    // 触摸移动
    carousel.addEventListener('touchmove', (e) => {
      if (!this.isTouching) return;
      this.currentX = e.touches[0].clientX;
      const diff = this.currentX - this.startX;
      
      // 实时跟随手指
      const baseOffset = -this.currentSlide * (window.innerWidth - 52);
      const offset = baseOffset + diff;
      this.carouselWrapper.style.transition = 'none';
      this.carouselWrapper.style.transform = `translateX(${offset}px)`;
    }, { passive: true });
    
    // 触摸结束
    carousel.addEventListener('touchend', (e) => {
      if (!this.isTouching) return;
      this.isTouching = false;
      
      const diff = this.currentX - this.startX;
      const threshold = 50;
      
      if (diff < -threshold) {
        this.nextSlide();
      } else if (diff > threshold) {
        this.prevSlide();
      } else {
        this.updateCarouselPosition();
      }
      
      // 重置自动播放
      this.startAutoPlay();
    });
    
    // 鼠标拖拽支持（PC端）
    carousel.addEventListener('mousedown', (e) => {
      this.isTouching = true;
      this.startX = e.clientX;
      this.currentX = this.startX;
      this.pauseAutoPlay();
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!this.isTouching) return;
      this.currentX = e.clientX;
      const diff = this.currentX - this.startX;
      
      const baseOffset = -this.currentSlide * (window.innerWidth - 52);
      const offset = baseOffset + diff;
      this.carouselWrapper.style.transition = 'none';
      this.carouselWrapper.style.transform = `translateX(${offset}px)`;
    });
    
    carousel.addEventListener('mouseup', (e) => {
      if (!this.isTouching) return;
      this.isTouching = false;
      
      const diff = this.currentX - this.startX;
      const threshold = 50;
      
      if (diff < -threshold) {
        this.nextSlide();
      } else if (diff > threshold) {
        this.prevSlide();
      } else {
        this.updateCarouselPosition();
      }
      
      this.startAutoPlay();
    });
    
    carousel.addEventListener('mouseleave', () => {
      if (this.isTouching) {
        this.isTouching = false;
        this.updateCarouselPosition();
        this.startAutoPlay();
      }
    });
  }

  updateCarouselPosition() {
    const slideWidth = window.innerWidth - 52;
    const offset = -this.currentSlide * slideWidth;
    
    this.carouselWrapper.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    this.carouselWrapper.style.transform = `translateX(${offset}px)`;
    
    // 更新指示器
    this.updateIndicators();
  }

  updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    const realIndex = this.currentSlide % this.carouselImages.length;
    
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === realIndex);
    });
  }

  nextSlide() {
    this.currentSlide++;
    
    // 如果滑到最后一张，快速跳到第一张（无缝）
    if (this.currentSlide >= this.carouselImages.length * 2) {
      setTimeout(() => {
        this.carouselWrapper.style.transition = 'none';
        this.currentSlide = this.carouselImages.length;
        this.updateCarouselPosition();
      }, 300);
    }
    
    this.updateCarouselPosition();
    
    // 触感反馈
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  prevSlide() {
    this.currentSlide--;
    
    // 如果滑到第一张之前，快速跳到最后一张（无缝）
    if (this.currentSlide < this.carouselImages.length) {
      setTimeout(() => {
        this.carouselWrapper.style.transition = 'none';
        this.currentSlide = this.carouselImages.length * 2 - 1;
        this.updateCarouselPosition();
      }, 300);
    }
    
    this.updateCarouselPosition();
    
    // 触感反馈
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  startAutoPlay() {
    this.pauseAutoPlay();
    this.carouselInterval = setInterval(() => {
      if (!this.isTouching) {
        this.nextSlide();
      }
    }, 3500); // 3.5秒间隔
  }

  pauseAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  
  // 初始化轮播图
  setTimeout(() => {
    if (window.app.initCarousel) {
      window.app.initCarousel();
    }
  }, 100);
});