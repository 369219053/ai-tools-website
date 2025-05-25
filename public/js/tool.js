// 工具页面管理
class ToolPageManager {
    constructor() {
        this.currentTool = null;
        this.toolId = this.getToolIdFromURL();
        this.isFavorited = false;
    }

    getToolIdFromURL() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    async init() {
        // 检查认证状态
        await AuthManager.checkAuth();
        
        // 加载工具信息
        await this.loadToolInfo();
        
        // 绑定事件监听器
        this.bindEventListeners();
    }

    async loadToolInfo() {
        try {
            const response = await APIClient.get(`/tools/${this.toolId}`);
            this.currentTool = response;
            this.renderToolInfo();
            this.showToolInterface();
        } catch (error) {
            console.error('加载工具信息失败:', error);
            this.showError('工具不存在或加载失败');
        }
    }

    renderToolInfo() {
        const toolInfo = document.getElementById('tool-info');
        const toolFeatures = document.getElementById('tool-features');
        const featuresList = document.getElementById('features-list');
        const toolName = document.getElementById('tool-name');

        if (this.currentTool) {
            toolInfo.innerHTML = `
                <div class="text-6xl mb-4">${this.currentTool.icon}</div>
                <h1 class="text-2xl font-bold mb-2">${this.currentTool.name}</h1>
                <p class="text-gray-600 mb-4">${this.currentTool.description}</p>
                <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">${this.currentTool.category}</span>
            `;

            featuresList.innerHTML = this.currentTool.features.map(feature => 
                `<li class="flex items-center"><span class="text-green-500 mr-2">✓</span>${feature}</li>`
            ).join('');

            toolFeatures.classList.remove('hidden');
            toolName.textContent = this.currentTool.name;
            
            // 更新页面标题
            document.title = `${this.currentTool.name} - AI工具箱`;
        }
    }

    showToolInterface() {
        // 隐藏所有工具界面
        document.querySelectorAll('.tool-interface').forEach(el => {
            el.classList.add('hidden');
        });

        // 显示对应的工具界面
        const interfaceId = `${this.toolId}-tool`;
        const toolInterface = document.getElementById(interfaceId);
        
        if (toolInterface) {
            toolInterface.classList.remove('hidden');
        } else {
            // 显示通用界面
            document.getElementById('generic-tool').classList.remove('hidden');
        }
    }

    showError(message) {
        const toolInfo = document.getElementById('tool-info');
        toolInfo.innerHTML = `
            <div class="text-6xl mb-4">❌</div>
            <h1 class="text-2xl font-bold mb-2">加载失败</h1>
            <p class="text-gray-600 mb-4">${message}</p>
            <a href="/" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                返回首页
            </a>
        `;
    }

    bindEventListeners() {
        // 收藏按钮
        document.getElementById('favorite-btn')?.addEventListener('click', () => this.toggleFavorite());

        // 工具表单提交
        document.getElementById('text-form')?.addEventListener('submit', (e) => this.handleTextGeneration(e));
        document.getElementById('image-form')?.addEventListener('submit', (e) => this.handleImageGeneration(e));
        document.getElementById('code-form')?.addEventListener('submit', (e) => this.handleCodeGeneration(e));
        document.getElementById('translation-form')?.addEventListener('submit', (e) => this.handleTranslation(e));

        // 结果操作
        document.getElementById('copy-result')?.addEventListener('click', () => this.copyResult());
        document.getElementById('download-result')?.addEventListener('click', () => this.downloadResult());

        // 认证相关
        document.getElementById('login-btn')?.addEventListener('click', () => openAuthModal('login'));
        document.getElementById('register-btn')?.addEventListener('click', () => openAuthModal('register'));
        document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());
        document.getElementById('profile-btn')?.addEventListener('click', () => window.location.href = '/profile');
    }

    async toggleFavorite() {
        if (!AppState.user) {
            showNotification('请先登录', 'warning');
            openAuthModal('login');
            return;
        }

        try {
            if (this.isFavorited) {
                await APIClient.delete(`/tools/${this.toolId}/favorite`);
                this.isFavorited = false;
                this.updateFavoriteButton();
                showNotification('取消收藏成功', 'success');
            } else {
                await APIClient.post(`/tools/${this.toolId}/favorite`);
                this.isFavorited = true;
                this.updateFavoriteButton();
                showNotification('收藏成功', 'success');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    updateFavoriteButton() {
        const favoriteIcon = document.getElementById('favorite-icon');
        const favoriteText = document.getElementById('favorite-text');
        const favoriteBtn = document.getElementById('favorite-btn');

        if (this.isFavorited) {
            favoriteIcon.textContent = '⭐';
            favoriteText.textContent = '已收藏';
            favoriteBtn.classList.remove('bg-gray-100', 'text-gray-700');
            favoriteBtn.classList.add('bg-yellow-100', 'text-yellow-700');
        } else {
            favoriteIcon.textContent = '☆';
            favoriteText.textContent = '收藏工具';
            favoriteBtn.classList.remove('bg-yellow-100', 'text-yellow-700');
            favoriteBtn.classList.add('bg-gray-100', 'text-gray-700');
        }
    }

    async handleTextGeneration(event) {
        event.preventDefault();
        
        if (!AppState.user) {
            showNotification('请先登录', 'warning');
            openAuthModal('login');
            return;
        }

        const prompt = document.getElementById('text-prompt').value.trim();
        const type = document.getElementById('text-type').value;
        const length = document.getElementById('text-length').value;

        if (!prompt) {
            showNotification('请输入生成提示', 'error');
            return;
        }

        this.setLoading('text', true);

        try {
            const response = await APIClient.post('/tools/text-generator/generate', {
                prompt,
                type,
                length
            });

            this.showResult({
                type: 'text',
                content: response.result.generatedText,
                metadata: {
                    prompt: response.result.originalPrompt,
                    type: response.result.type,
                    wordCount: response.result.wordCount
                }
            });

            showNotification('文本生成成功！', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setLoading('text', false);
        }
    }

    async handleImageGeneration(event) {
        event.preventDefault();
        
        if (!AppState.user) {
            showNotification('请先登录', 'warning');
            openAuthModal('login');
            return;
        }

        const prompt = document.getElementById('image-prompt').value.trim();
        const style = document.getElementById('image-style').value;
        const size = document.getElementById('image-size').value;

        if (!prompt) {
            showNotification('请输入图像描述', 'error');
            return;
        }

        this.setLoading('image', true);

        try {
            const response = await APIClient.post('/tools/image-generator/generate', {
                prompt,
                style,
                size
            });

            this.showResult({
                type: 'image',
                content: response.result.imageUrl,
                metadata: {
                    prompt: response.result.prompt,
                    style: response.result.style,
                    size: response.result.size
                }
            });

            showNotification('图像生成成功！', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setLoading('image', false);
        }
    }

    async handleCodeGeneration(event) {
        event.preventDefault();
        
        if (!AppState.user) {
            showNotification('请先登录', 'warning');
            openAuthModal('login');
            return;
        }

        const description = document.getElementById('code-description').value.trim();
        const language = document.getElementById('code-language').value;
        const type = document.getElementById('code-type').value;

        if (!description) {
            showNotification('请输入功能描述', 'error');
            return;
        }

        this.setLoading('code', true);

        try {
            const response = await APIClient.post('/tools/code-assistant/generate', {
                description,
                language,
                type
            });

            this.showResult({
                type: 'code',
                content: response.result.code,
                metadata: {
                    description: response.result.description,
                    language: response.result.language,
                    explanation: response.result.explanation
                }
            });

            showNotification('代码生成成功！', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setLoading('code', false);
        }
    }

    async handleTranslation(event) {
        event.preventDefault();
        
        if (!AppState.user) {
            showNotification('请先登录', 'warning');
            openAuthModal('login');
            return;
        }

        const text = document.getElementById('translation-text').value.trim();
        const fromLang = document.getElementById('from-lang').value;
        const toLang = document.getElementById('to-lang').value;

        if (!text) {
            showNotification('请输入要翻译的文本', 'error');
            return;
        }

        this.setLoading('translation', true);

        try {
            const response = await APIClient.post('/tools/translation/translate', {
                text,
                fromLang,
                toLang
            });

            this.showResult({
                type: 'translation',
                content: response.result.translatedText,
                metadata: {
                    originalText: response.result.originalText,
                    fromLanguage: response.result.fromLanguage,
                    toLanguage: response.result.toLanguage,
                    confidence: response.result.confidence
                }
            });

            showNotification('翻译成功！', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            this.setLoading('translation', false);
        }
    }

    setLoading(toolType, isLoading) {
        const loadingSpinner = document.getElementById(`${toolType}-loading`);
        const submitText = document.getElementById(`${toolType}-submit-text`);
        const submitButton = document.querySelector(`#${toolType}-form button[type="submit"]`);

        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            submitText.textContent = '生成中...';
            submitButton.disabled = true;
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            loadingSpinner.classList.add('hidden');
            submitText.textContent = this.getSubmitText(toolType);
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    getSubmitText(toolType) {
        const texts = {
            text: '生成文本',
            image: '生成图像',
            code: '生成代码',
            translation: '翻译'
        };
        return texts[toolType] || '提交';
    }

    showResult(result) {
        const resultSection = document.getElementById('result-section');
        const resultContent = document.getElementById('result-content');

        this.currentResult = result;

        let contentHTML = '';

        switch (result.type) {
            case 'text':
                contentHTML = `
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">生成的文本：</h4>
                        <div class="whitespace-pre-wrap">${result.content}</div>
                    </div>
                    <div class="text-sm text-gray-500">
                        <p>原始提示: ${result.metadata.prompt}</p>
                        <p>类型: ${result.metadata.type} | 字数: ${result.metadata.wordCount}</p>
                    </div>
                `;
                break;

            case 'image':
                contentHTML = `
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">生成的图像：</h4>
                        <img src="${result.content}" alt="Generated Image" class="max-w-full h-auto rounded-lg shadow-md">
                    </div>
                    <div class="text-sm text-gray-500">
                        <p>描述: ${result.metadata.prompt}</p>
                        <p>风格: ${result.metadata.style} | 尺寸: ${result.metadata.size}</p>
                    </div>
                `;
                break;

            case 'code':
                contentHTML = `
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">生成的代码：</h4>
                        <pre class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto"><code>${result.content}</code></pre>
                    </div>
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">代码说明：</h4>
                        <p class="text-gray-700">${result.metadata.explanation}</p>
                    </div>
                    <div class="text-sm text-gray-500">
                        <p>描述: ${result.metadata.description}</p>
                        <p>语言: ${result.metadata.language}</p>
                    </div>
                `;
                break;

            case 'translation':
                contentHTML = `
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">翻译结果：</h4>
                        <div class="bg-blue-50 p-3 rounded-lg">${result.content}</div>
                    </div>
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">原文：</h4>
                        <div class="bg-gray-50 p-3 rounded-lg">${result.metadata.originalText}</div>
                    </div>
                    <div class="text-sm text-gray-500">
                        <p>从 ${result.metadata.fromLanguage} 翻译到 ${result.metadata.toLanguage}</p>
                        <p>置信度: ${(result.metadata.confidence * 100).toFixed(1)}%</p>
                    </div>
                `;
                break;
        }

        resultContent.innerHTML = contentHTML;
        resultSection.classList.remove('hidden');
        resultSection.classList.add('result-fade-in');

        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    copyResult() {
        if (!this.currentResult) return;

        let textToCopy = '';

        switch (this.currentResult.type) {
            case 'text':
            case 'translation':
                textToCopy = this.currentResult.content;
                break;
            case 'code':
                textToCopy = this.currentResult.content;
                break;
            case 'image':
                textToCopy = this.currentResult.content; // 图片URL
                break;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('已复制到剪贴板', 'success');
        }).catch(() => {
            showNotification('复制失败', 'error');
        });
    }

    downloadResult() {
        if (!this.currentResult) return;

        let filename = '';
        let content = '';
        let mimeType = '';

        switch (this.currentResult.type) {
            case 'text':
                filename = 'generated-text.txt';
                content = this.currentResult.content;
                mimeType = 'text/plain';
                break;
            case 'code':
                const ext = this.getFileExtension(this.currentResult.metadata.language);
                filename = `generated-code.${ext}`;
                content = this.currentResult.content;
                mimeType = 'text/plain';
                break;
            case 'translation':
                filename = 'translation.txt';
                content = `原文：\n${this.currentResult.metadata.originalText}\n\n翻译：\n${this.currentResult.content}`;
                mimeType = 'text/plain';
                break;
            case 'image':
                // 对于图片，我们下载图片URL
                const link = document.createElement('a');
                link.href = this.currentResult.content;
                link.download = 'generated-image.jpg';
                link.click();
                showNotification('图片下载已开始', 'success');
                return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('文件下载已开始', 'success');
    }

    getFileExtension(language) {
        const extensions = {
            javascript: 'js',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            html: 'html',
            css: 'css'
        };
        return extensions[language] || 'txt';
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    const toolPageManager = new ToolPageManager();
    await toolPageManager.init();
    
    // 将实例暴露给全局作用域以便调试
    window.toolPageManager = toolPageManager;
}); 