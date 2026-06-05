/**
 * 安全认证工具 - 所有敏感数据都通过后端处理
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isPro: boolean;
  };
}

export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * 登录 - 密码通过 HTTPS 发送到后端，不在前端存储
 */
export async function login(credentials: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 自动发送和接收 HttpOnly Cookies
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  return response.json();
}

/**
 * 注册 - 密码在后端使用 bcrypt 哈希处理
 */
export async function register(credentials: LoginPayload & { avatar: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }

  return response.json();
}

/**
 * 验证邀请码 - 后端验证，不在前端硬编码
 */
export async function verifyInviteCode(code: string): Promise<{ valid: boolean; plan?: string }> {
  const response = await fetch(`${API_BASE}/api/auth/verify-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    return { valid: false };
  }

  return response.json();
}

/**
 * 获取当前用户信息 - 从 JWT Token 读取
 */
export async function getCurrentUser(): Promise<AuthResponse['user'] | null> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include', // Cookie 中的 JWT 会自动发送
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  // 服务器会清除 HttpOnly Cookie
}

/**
 * 检查 Pro 权限 - 后端验证
 */
export async function checkProAccess(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/check-pro`, {
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.isPro;
  } catch {
    return false;
  }
}

/**
 * 只在 sessionStorage 存储非敏感的用户信息
 * 实际的令牌在 HttpOnly Cookie 中
 */
export function saveUserSession(user: AuthResponse['user']): void {
  sessionStorage.setItem(
    'user_session',
    JSON.stringify({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isPro: user.isPro,
      timestamp: Date.now(),
    })
  );
}

export function getUserSession(): AuthResponse['user'] | null {
  try {
    const data = sessionStorage.getItem('user_session');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearUserSession(): void {
  sessionStorage.removeItem('user_session');
}
