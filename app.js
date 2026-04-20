/* ========================================
   陈总的小窝 - 简化版
   ======================================== */

class App {
  constructor() {
    this.files = [];
    this.init();
  }

  async init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.bindElements();
    this.initParticles();
    this.initCarousel();
    this.loadFiles();
    this.bindEvents();
    this.loadTheme();
    this.hideSplash();
  }

  bindElements() {
    this.splashScreen = document.getElementById('splash-screen');
    this.fileList = document.getElementById('fileList');
    this.particleCanvas = document.getElementById('particle-canvas');
  }

  // ===== 粒子背景 =====
  initParticles() {
    const canvas = this.particleCanvas;
    const ctx = canvas.getContext('2d');
    this.particles = [];
    const particleColor = '#D4A574';
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  // ===== 文件系统 =====
  async loadFiles() {
    this.files = [
      { id: 1, name: 'Photoshop 2024', size: '2.4 GB', category: 'software', icon: '🎨' },
      { id: 2, name: 'VSCode', size: '89 MB', category: 'software', icon: '💻' },
      { id: 3, name: '原神', size: '18.5 GB', category: 'game', icon: '🎮' },
      { id: 4, name: '星穹铁道', size: '12.3 GB', category: 'game', icon: '⚡' },
      { id: 5, name: 'Python教程', size: '25 MB', category: 'document', icon: '📚' },
      { id: 6, name: 'AI提示词', size: '5.2 MB', category: 'document', icon: '🤖' },
    ];
    
    this.renderFiles();
  }

  renderFiles() {
    const container = document.getElementById('fileList');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.files.forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'file-card';
      card.style.animationDelay = `${index * 80}ms`;
      card.innerHTML = `
        <div class="file-icon">${file.icon}</div>
        <div class="file-name">${file.name}</div>
        <div class="file-size">${file.size}</div>
      `;
      container.appendChild(card);
    });
  }

  // ===== 启动画面 =====
  hideSplash() {
    setTimeout(() => {
      this.splashScreen.classList.add('hidden');
    }, 2000);
  }

  // ===== 事件绑定 =====
  bindEvents() {
    this.setupCardInteractions();
    this.setupContextMenu();
    this.setupButtonEffects();
  }

  // ===== 卡片交互 =====
  setupCardInteractions() {
    const container = document.getElementById('fileList');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const card = e.target.closest('.file-card');
      if (!card) return;

      // 移除其他卡片的激活状态
      document.querySelectorAll('.file-card.active').forEach(c => {
        c.classList.remove('active');
      });

      // 激活当前卡片
      card.classList.add('active');
      
      // 显示文件信息
      const index = Array.from(container.children).indexOf(card);
      if (this.files[index]) {
        this.showFileInfo(this.files[index]);
      }
    });

    // 卡片悬停效果
    container.addEventListener('mouseenter', (e) => {
      const card = e.target.closest('.file-card');
      if (card) {
        card.style.transform = 'scale(1.03)';
      }
    }, true);

    container.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.file-card');
      if (card) {
        card.style.transform = '';
      }
    }, true);
  }

  // 显示文件信息
  showFileInfo(file) {
    // 可以扩展为弹出详情面板
    console.log('选中文件:', file.name);
  }

  // ===== 右键菜单 =====
  setupContextMenu() {
    const container = document.getElementById('fileList');
    if (!container) return;

    // 阻止默认右键菜单
    document.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('.file-card');
      if (card) {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY, card);
      }
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
  }

  showContextMenu(x, y, card) {
    this.hideContextMenu(); // 先关闭旧的

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="context-menu-item" data-action="open">📂 打开</div>
      <div class="context-menu-item" data-action="info">ℹ️ 详情</div>
      <div class="context-menu-item" data-action="copy">📋 复制</div>
      <div class="context-menu-item" data-action="delete">🗑️ 删除</div>
    `;
    
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      z-index: 1000;
      min-width: 120px;
    `;

    // 菜单项点击事件
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const index = Array.from(card.parentElement.children).indexOf(card);
        this.handleContextAction(action, this.files[index]);
        this.hideContextMenu();
      });
    });

    document.body.appendChild(menu);
    
    // 边界检测
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height}px`;
    }
  }

  hideContextMenu() {
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
  }

  handleContextAction(action, file) {
    if (!file) return;
    console.log(`执行操作: ${action}`, file.name);
    // 可以根据不同操作显示不同反馈
  }

  // ===== 按钮点击效果 =====
  setupButtonEffects() {
    // 分类按钮
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 移除其他按钮激活状态
        categoryBtns.forEach(b => b.classList.remove('active'));
        // 激活当前按钮
        e.target.classList.add('active');
        // 执行筛选
        const category = e.target.dataset.category;
        this.filterFiles(category);
      });
    });

    // 主题切换按钮
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // 底部导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        navItems.forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  }

  // 筛选文件
  filterFiles(category) {
    const allCards = document.querySelectorAll('.file-card');
    allCards.forEach((card, index) => {
      if (category === 'all') {
        card.style.display = '';
        card.style.animation = 'fadeIn 0.3s ease forwards';
      } else {
        const file = this.files[index];
        if (file && file.category === category) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      }
    });
  }

  // 主题切换
  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // 加载保存的主题
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }

  // ===== 轮播图 =====
  initCarousel() {
    const wrapper = document.getElementById('carousel-wrapper');
    const indicators = document.querySelectorAll('.carousel-indicator span');
    if (!wrapper || indicators.length === 0) return;

    let currentIndex = 0;
    const totalSlides = 3;

    const goToSlide = (index) => {
      currentIndex = index;
      wrapper.style.transform = `translateX(-${index * 100}%)`;
      
      indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
      });
    };

    // 指示器点击
    indicators.forEach((ind, i) => {
      ind.addEventListener('click', () => goToSlide(i));
    });

    // 自动轮播
    setInterval(() => {
      const nextIndex = (currentIndex + 1) % totalSlides;
      goToSlide(nextIndex);
    }, 4000);
  }
}

// 启动
new App();