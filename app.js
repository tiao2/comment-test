const REPO_OWNER = 'tiao2';
const REPO_NAME = 'comment-test';
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

// 修改初始化逻辑
document.addEventListener('DOMContentLoaded', () => {
    parseTokenFromURL(); // 新增：优先处理 URL 中的 token
    // 原有逻辑
    if (localStorage.getItem('gh_token')) {
        toggleLoginState(true);
        loadPosts();
    }
});

// 修改登录函数
function login() {
    // 直接跳转 GitHub 授权页面（不再使用弹窗）
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJfdCXIjcPtQm2t&redirect_uri=${encodeURIComponent('http://tiao2.ct.ws/oauth.php')}`;
}

// 加载帖子列表
async function loadPosts() {
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`);
        const posts = await res.json();
        
        let html = '<h2>最新帖子</h2>';
        posts.forEach(post => {
            html += `
                <div class="post" onclick="showDetail(${post.number})">
                    <h3>${post.title}</h3>
                    <p>${post.body.substr(0, 100)}...</p>
                    <small>作者: ${post.user.login}</small>
                </div>
            `;
        });
        
        document.getElementById('posts').innerHTML = html;
    } catch (err) {
        console.error('加载帖子失败:', err);
    }
}

// 显示帖子详情
async function showDetail(issueId) {
    try {
        const [post, comments] = await Promise.all([
            fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}`).then(res => res.json()),
            fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}/comments`).then(res => res.json())
        ]);

        document.getElementById('posts').style.display = 'none';
        document.getElementById('postDetail').style.display = 'block';
        
        // 渲染详情
        document.getElementById('detailTitle').textContent = post.title;
        document.getElementById('detailBody').innerHTML = marked.parse(post.body); // 使用 marked 解析 Markdown
        
        // 渲染评论
        let commentsHtml = '';
        comments.forEach(comment => {
            commentsHtml += `
                <div class="comment">
                    <strong>${comment.user.login}</strong>
                    <p>${marked.parse(comment.body)}</p>
                </div>
            `;
        });
        document.getElementById('comments').innerHTML = commentsHtml;
    } catch (err) {
        console.error('加载详情失败:', err);
    }
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
    const issueId = document.querySelector('#postDetail h2').id.replace('detail-', '');
    
    try {
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: document.getElementById('newComment').value
            })
        });
        
        document.getElementById('newComment').value = '';
        showDetail(issueId); // 刷新评论
    } catch (err) {
        alert('评论失败: ' + err.message);
    }
}
