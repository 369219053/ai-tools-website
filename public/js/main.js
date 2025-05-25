// 全局状态管理
const AppState = {
    user: null,
    token: localStorage.getItem('token'),
    tools: []
};

// API 基础配置
const API_BASE = '/api';

// 工具类
class APIClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (AppState.token) {
            config.headers.Authorization = `Bearer ${AppState.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 认证管理
class AuthManager {
    static async login(email, password) {
        try {
            const response = await APIClient.post('/auth/login', { email, password });
            AppState.token = response.token;
            AppState.user = response.user;
            localStorage.setItem('token', response.token);
            this.updateUI();
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            const response = await APIClient.post('/auth/register', { username, email, password });
            AppState.token = response.token;
            AppState.user = response.user;
            localStorage.setItem('token', response.token);
            this.updateUI();
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async logout() {
        try {
            await APIClient.post('/auth/logout');
        } catch (error) {
            console.error('登出请求失败:', error);
        } finally {
            AppState.token = null;
            AppState.user = null;
            localStorage.removeItem('token');
            this.updateUI();
        }
    }

    static async checkAuth() {
        if (!AppState.token) return false;

        try {
            const response = await APIClient.get('/auth/me');
            AppState.user = response.user;
            this.updateUI();
            return true;
        } catch (error) {
            console.error('验证失败:', error);
            this.logout();
            return false;
        }
    }

    static updateUI() {
        const userMenu = document.getElementById('user-menu');
        const authButtons = document.getElementById('auth-buttons');
        const username = document.getElementById('username');

        if (AppState.user) {
            userMenu.classList.remove('hidden');
            authButtons.classList.add('hidden');
            username.textContent = AppState.user.username;
        } else {
            userMenu.classList.add('hidden');
            authButtons.classList.remove('hidden');
        }
    }
}

// 工具管理
class ToolsManager {
    static async loadTools() {
        try {
            const response = await APIClient.get('/tools');
            AppState.tools = response.tools;
            this.renderTools();
        } catch (error) {
            console.error('加载工具失败:', error);
            this.renderError();
        }
    }

    static renderTools() {
        const toolsGrid = document.getElementById('tools-grid');
        if (!toolsGrid) return;

        toolsGrid.innerHTML = AppState.tools.map(tool => `
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover cursor-pointer" onclick="ToolsManager.openTool('${tool.id}')">
                <div class="text-4xl mb-4">${tool.icon}</div>
                <h3 class="text-xl font-semibold mb-2">${tool.name}</h3>
                <p class="text-gray-600 mb-4">${tool.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${tool.features.slice(0, 2).map(feature => 
                        `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${feature}</span>`
                    ).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${tool.category}</span>
                    <button class="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        使用工具
                    </button>
                </div>
            </div>
        `).join('');
    }

    static renderError() {
        const toolsGrid = document.getElementById('tools-grid');
        if (!toolsGrid) return;

        toolsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">😔</div>
                <h3 class="text-xl font-semibold mb-2">加载失败</h3>
                <p class="text-gray-600 mb-4">无法加载工具列表，请稍后重试</p>
                <button onclick="ToolsManager.loadTools()" class="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    重新加载
                </button>
            </div>
        `;
    }

    static openTool(toolId) {
        if (!AppState.user) {
            showNotification('请先登录后使用工具', 'warning');
            openAuthModal('login');
            return;
        }

        // 跳转到工具页面
        window.location.href = `/tools/${toolId}`;
    }
}

// 模态框管理
class ModalManager {
    static currentMode = 'login';

    static open(mode = 'login') {
        this.currentMode = mode;
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('modal-title');
        const submitText = document.getElementById('submit-text');
        const switchText = document.getElementById('switch-text');
        const usernameField = document.getElementById('username-field');

        if (mode === 'login') {
            title.textContent = '登录';
            submitText.textContent = '登录';
            switchText.textContent = '没有账号？立即注册';
            usernameField.classList.add('hidden');
        } else {
            title.textContent = '注册';
            submitText.textContent = '注册';
            switchText.textContent = '已有账号？立即登录';
            usernameField.classList.remove('hidden');
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    static close() {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clearForm();
    }

    static switch() {
        this.open(this.currentMode === 'login' ? 'register' : 'login');
    }

    static clearForm() {
        document.getElementById('auth-form').reset();
    }

    static async handleSubmit(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        try {
            if (this.currentMode === 'login') {
                await AuthManager.login(email, password);
                showNotification('登录成功！', 'success');
            } else {
                if (!username) {
                    showNotification('请输入用户名', 'error');
                    return;
                }
                await AuthManager.register(username, email, password);
                showNotification('注册成功！', 'success');
            }
            this.close();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // 自动消失
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// 全局函数
function openAuthModal(mode) {
    ModalManager.open(mode);
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 检查认证状态
    await AuthManager.checkAuth();

    // 加载工具列表
    await ToolsManager.loadTools();

    // 绑定事件监听器
    bindEventListeners();

    // 平滑滚动
    setupSmoothScroll();
});

function bindEventListeners() {
    // 认证按钮
    document.getElementById('login-btn')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('register-btn')?.addEventListener('click', () => openAuthModal('register'));
    document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());

    // 模态框
    document.getElementById('close-modal')?.addEventListener('click', () => ModalManager.close());
    document.getElementById('switch-mode')?.addEventListener('click', () => ModalManager.switch());
    document.getElementById('auth-form')?.addEventListener('submit', (e) => ModalManager.handleSubmit(e));

    // 点击模态框外部关闭
    document.getElementById('auth-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') {
            ModalManager.close();
        }
    });

    // 开始按钮
    document.getElementById('start-btn')?.addEventListener('click', () => {
        if (AppState.user) {
            document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
        } else {
            openAuthModal('register');
        }
    });

    // 个人中心按钮
    document.getElementById('profile-btn')?.addEventListener('click', () => {
        window.location.href = '/profile';
    });
}

function setupSmoothScroll() {
    // 为所有锚点链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // ESC 关闭模态框
    if (e.key === 'Escape') {
        ModalManager.close();
    }
});

// 导出给全局使用
window.AppState = AppState;
window.AuthManager = AuthManager;
window.ToolsManager = ToolsManager;
window.showNotification = showNotification; 