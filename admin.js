// 管理后台 JavaScript

// 模拟数据
const mockData = {
  stats: {
    todayVisits: 1234,
    newUsers: 56,
    carouselClicks: 89,
    messages: 12
  },
  carousel: [
    { id: 1, url: 'https://picsum.photos/400/533?random=1', order: 1 },
    { id: 2, url: 'https://picsum.photos/400/533?random=2', order: 2 },
    { id: 3, url: 'https://picsum.photos/400/533?random=3', order: 3 },
    { id: 4, url: 'https://picsum.photos/400/533?random=4', order: 4 }
  ],
  users: [
    { id: 1, name: '小明', avatar: '👦', level: 'VIP', enabled: true },
    { id: 2, name: '小红', avatar: '👧', level: '普通', enabled: true },
    { id: 3, name: '小刚', avatar: '👨', level: 'VIP', enabled: false },
    { id: 4, name: '小丽', avatar: '👩', level: '普通', enabled: true },
    { id: 5, name: '阿强', avatar: '🧑', level: 'VIP', enabled: true }
  ]
};

// 检查登录状态
function checkAuth() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  if (isLoggedIn) {
    showMainPage();
  } else {
    showLoginPage();
  }
}

// 显示登录页
function showLoginPage() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainPage').classList.add('hidden');
}

// 显示后台主页
function showMainPage() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');
  loadDashboardData();
}

// 登录
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // 简单的验证（实际应该对接后端）
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminLoggedIn', 'true');
    showMainPage();
  } else {
    alert('用户名或密码错误！');
  }
});

// 退出登录
function logout() {
  localStorage.removeItem('adminLoggedIn');
  showLoginPage();
}

// 切换页面
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    const page = this.dataset.page;
    
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    
    // 隐藏所有页面
    document.querySelectorAll('.admin-content').forEach(p => p.classList.add('hidden'));
    
    // 显示目标页面
    document.getElementById(page + 'Page').classList.remove('hidden');
    
    // 加载对应数据
    if (page === 'carousel') {
      loadCarouselList();
    } else if (page === 'users') {
      loadUserList();
    }
  });
});

// 加载看板数据
function loadDashboardData() {
  document.getElementById('todayVisits').textContent = mockData.stats.todayVisits;
  document.getElementById('newUsers').textContent = mockData.stats.newUsers;
  document.getElementById('carouselClicks').textContent = mockData.stats.carouselClicks;
  document.getElementById('messages').textContent = mockData.stats.messages;
}

// 加载轮播列表
function loadCarouselList() {
  const list = document.getElementById('carouselList');
  list.innerHTML = mockData.carousel.map(item => `
    <div class="carousel-item">
      <img src="${item.url}" alt="轮播图${item.id}">
      <div class="carousel-item-info">
        <h4>轮播图 #${item.id}</h4>
        <p>排序: ${item.order}</p>
      </div>
      <div class="carousel-item-actions">
        <button class="btn-edit" onclick="editCarousel(${item.id})">编辑</button>
        <button class="btn-delete" onclick="deleteCarousel(${item.id})">删除</button>
      </div>
    </div>
  `).join('');
  
  // 更新预览
  if (mockData.carousel.length > 0) {
    document.getElementById('previewScreen').innerHTML = 
      `<img src="${mockData.carousel[0].url}" alt="预览">`;
  }
}

// 加载用户列表
function loadUserList() {
  const list = document.getElementById('userList');
  list.innerHTML = mockData.users.map(user => `
    <div class="user-item">
      <div class="user-avatar">${user.avatar}</div>
      <div class="user-info">
        <h4>${user.name}</h4>
        <p>ID: ${user.id}</p>
      </div>
      <span class="user-badge ${user.level === 'VIP' ? 'vip' : ''}">${user.level}</span>
      <button class="btn-toggle ${user.enabled ? '' : 'disabled'}" 
        onclick="toggleUser(${user.id})">
        ${user.enabled ? '禁用' : '启用'}
      </button>
    </div>
  `).join('');
}

// 切换用户状态
function toggleUser(userId) {
  const user = mockData.users.find(u => u.id === userId);
  if (user) {
    user.enabled = !user.enabled;
    loadUserList();
  }
}

// 显示添加轮播图弹窗
function showAddCarouselModal() {
  document.getElementById('carouselModal').classList.remove('hidden');
  document.getElementById('carouselUrl').value = '';
  document.getElementById('carouselOrder').value = mockData.carousel.length + 1;
}

// 隐藏添加轮播图弹窗
function hideCarouselModal() {
  document.getElementById('carouselModal').classList.add('hidden');
}

// 保存轮播图
function saveCarousel() {
  const url = document.getElementById('carouselUrl').value;
  const order = parseInt(document.getElementById('carouselOrder').value);
  const fileInput = document.getElementById('carouselFile');
  
  if (fileInput.files.length > 0) {
    // 处理文件上传（本地预览）
    const reader = new FileReader();
    reader.onload = function(e) {
      const newCarousel = {
        id: Date.now(),
        url: e.target.result,
        order: order
      };
      mockData.carousel.push(newCarousel);
      loadCarouselList();
      hideCarouselModal();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else if (url) {
    const newCarousel = {
      id: Date.now(),
      url: url,
      order: order
    };
    mockData.carousel.push(newCarousel);
    loadCarouselList();
    hideCarouselModal();
  } else {
    alert('请输入图片URL或上传图片');
  }
}

// 编辑轮播图
function editCarousel(id) {
  const item = mockData.carousel.find(c => c.id === id);
  if (item) {
    document.getElementById('carouselUrl').value = item.url;
    document.getElementById('carouselOrder').value = item.order;
    document.getElementById('carouselModal').classList.remove('hidden');
  }
}

// 删除轮播图
function deleteCarousel(id) {
  if (confirm('确定要删除这个轮播图吗？')) {
    const index = mockData.carousel.findIndex(c => c.id === id);
    if (index > -1) {
      mockData.carousel.splice(index, 1);
      loadCarouselList();
    }
  }
}

// 保存设置
function saveSettings() {
  alert('设置已保存！');
}

// 初始化
document.addEventListener('DOMContentLoaded', checkAuth);