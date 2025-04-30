const REPO_OWNER = 'tiao2';
const REPO_NAME = 'comment-test';
// 在 app.js 开头添加全局错误捕获
window.onerror = (msg, url, line, col, error) => {
    console.error('全局错误捕获:', { msg, url, line, col, error });
};

// 在文件开头定义函数（确保全局可用）
function safeMarkdown(text) {
  try {
    // 检查 marked 库是否加载
    if (typeof marked?.parse !== 'function') {
      console.warn('Markdown 解析库未加载，显示原始内容');
      return text || '';
    }
    // 安全解析并返回
    return marked.parse(text);
  } catch (err) {
    console.error('Markdown 解析失败:', err);
    return text || '';
  }
}

// 在文件开头添加 URL 参数解析函数
function parseTokenFromURL() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const error = params.get('error');

    // 清除 URL 参数（避免泄露）
    if (token || error) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 处理 token
    if (token) {
        localStorage.setItem('gh_token', token);
        toggleLoginState(true);
        loadPosts();
    }

    // 处理错误
    if (error) {
        const msg = params.get('msg') || '授权流程失败';
        alert(`错误: ${msg}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 优先处理 URL 中的 Token
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('access_token')) {
        const token = urlParams.get('access_token');
        localStorage.setItem('gh_token', token);
        window.history.replaceState({}, '', window.location.pathname); // 清理 URL
    }

    // 初始化加载
    if (localStorage.getItem('gh_token')) {
        toggleLoginState(true);
        loadPosts();
    } else {
        console.warn('用户未登录，仅显示公开内容');
    }
});

// 修改登录函数
function login() {
    // 直接跳转 GitHub 授权页面（不再使用弹窗）
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJfdCXIjcPtQm2t&redirect_uri=${encodeURIComponent('http://tiao2.ct.ws/oauth.php')}&scope=repo`;
}

// 加载帖子列表
// 修改 loadPosts 函数，确保数据存在后再渲染
async function loadPosts() {
    try {
        const token = localStorage.getItem('gh_token');
        if (!token) return;

        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // 确保响应数据为有效数组
        const posts = await res.json();
        if (!Array.isArray(posts)) {
            throw new Error('API 返回数据格式异常');
        }

        // 安全渲染逻辑
        renderPosts(posts);
    } catch (err) {
        console.error('完整错误堆栈:', err);
        showError(`加载失败: ${err.message}`);
    }
}

// 修改 loadPosts 函数中的渲染逻辑
function renderPosts(posts) {
    let html = '<h2>最新帖子</h2>';
    
    posts.forEach(post => {
        // 安全访问嵌套属性
        const title = post.title || '无标题';
        const body = post.body?.substring(0, 100) || '内容为空';
        const author = post.user?.login || '匿名用户';

        html += `
            <div class="post" onclick="showDetail(${post.number})">
                <h3>${title}</h3>
                <p>${body}...</p>
                <small>作者: ${author}</small>
            </div>
        `;
    });
    
    document.getElementById('posts').innerHTML = html;
}

async function showDetail(issueId) {
    try {
        // 保存当前帖子ID到全局变量（用于后续提交）
        window.currentIssueId = issueId;

        // 并行获取帖子和评论
        const [postRes, commentsRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}`),
            fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}/comments`)
        ]);

        // 统一处理响应状态
        if (!postRes.ok || !commentsRes.ok) {
            throw new Error(`请求失败: ${postRes.status} / ${commentsRes.status}`);
        }

        // 解析数据
        const post = await postRes.json();
        const comments = await commentsRes.json();

        // 安全渲染逻辑
        document.getElementById('detailTitle').textContent = post.title || '未知帖子';
        document.getElementById('detailBody').innerHTML = safeMarkdown(post.body);
        
        // 渲染评论（处理空数据）
        const commentsContainer = document.getElementById('comments');
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<div class="empty">暂无评论</div>';
        } else {
            commentsContainer.innerHTML = comments.map(comment => `
                <div class="comment">
                    <strong>${comment.user?.login || '匿名用户'}</strong>
                    <p>${safeMarkdown(comment.body)}</p>
                    <small>${new Date(comment.created_at).toLocaleString()}</small>
                </div>
            `).join('');
        }

        // 切换视图
        document.getElementById('posts').style.display = 'none';
        document.getElementById('postDetail').style.display = 'block';
    } catch (err) {
        console.error('加载详情失败:', err);
        alert(`加载失败: ${err.message}`);
    }
}
// 新增错误提示函数
function showError(msg) {
    const errorDiv = document.getElementById('errorAlert');
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}



function logout() {
    localStorage.removeItem('gh_token');
    toggleLoginState(false);
}

function toggleLoginState(isLoggedIn) {
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('postForm').style.display = isLoggedIn ? 'block' : 'none';
}

// 发帖功能
async function createPost() {
    const token = localStorage.getItem('gh_token');
    try {
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: document.getElementById('postTitle').value,
                body: document.getElementById('postContent').value
            })
        });
        
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        loadPosts();
    } catch (err) {
        alert('发帖失败: ' + err.message);
    }
}

// 提交评论
async function submitComment() {
    const token = localStorage.getItem('gh_token');
    if (!token) {
        alert('请先登录！');
        return;
    }

    const commentText = document.getElementById('newComment').value.trim();
    if (!commentText) {
        alert('评论内容不能为空');
        return;
    }

    try {
        // 使用保存的全局ID
        const issueId = window.currentIssueId;
        if (!issueId) throw new Error('未找到当前帖子ID');

        // 提交评论
        const res = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}/comments`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({ body: commentText })
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || '评论提交失败');
        }

        // 清空输入并刷新评论
        document.getElementById('newComment').value = '';
        await showDetail(issueId); // 重新加载最新评论
    } catch (err) {
        console.error('提交评论失败:', err);
        alert(`提交失败: ${err.message}`);
    }
}

// 在文件末尾添加以下函数
function hideDetail() {
    document.getElementById('postDetail').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
    loadPosts(); // 重新加载确保数据最新
}
