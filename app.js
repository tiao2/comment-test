// 配置项（需替换为你的信息）
const CLIENT_ID = 'YOUR_CLIENT_ID';          // 替换为你的 OAuth App Client ID
const REPO_OWNER = 'your_username';          // 仓库所有者
const REPO_NAME = 'your_repo';               // 仓库名称
const ISSUE_NUMBER = 1;                      // 目标 Issue 编号

// 初始化：检查 URL 中是否有 Access Token
document.addEventListener('DOMContentLoaded', () => {
    const token = getAccessTokenFromUrl();
    if (token) {
        hideLoginButton();
        showCommentForm();
        localStorage.setItem('github_token', token);
    }
});

// GitHub OAuth 登录跳转
function loginWithGitHub() {
    const redirectUri = encodeURIComponent(window.location.href);
    const scope = encodeURIComponent('public_repo');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
}

// 从 URL 中提取 Access Token
function getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

// 提交评论到 GitHub Issue
async function submitComment() {
    const token = localStorage.getItem('github_token');
    const commentText = document.getElementById('commentInput').value;

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: commentText })
        });

        if (response.ok) {
            alert('Comment posted successfully!');
        } else {
            alert('Error posting comment: ' + (await response.text()));
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
}

// 显示/隐藏 UI 组件
function hideLoginButton() {
    document.getElementById('loginBtn').classList.add('hidden');
}
function showCommentForm() {
    document.getElementById('commentForm').classList.remove('hidden');
}
