const REPO_OWNER = 'tiao2';
const REPO_NAME = 'comment-test';

// 初始化检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('gh_token')) {
        toggleLoginState(true);
    }
    loadPosts();
});

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

// 登录/登出逻辑
function login() {
    const authWindow = window.open(
        `https://github.com/login/oauth/authorize?client_id=Ov23liJfdCXIjcPtQm2t&redirect_uri=${encodeURIComponent('tiao2.ct.ws/oauth.php')}`,
        'auth',
        'width=500,height=600'
    );
}

window.addEventListener('message', (e) => {
    if (e.data.type === 'oauth') {
        localStorage.setItem('gh_token', e.data.token);
        toggleLoginState(true);
        loadPosts();
    }
});

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
