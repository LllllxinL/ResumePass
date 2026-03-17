import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 用户数据类型
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// 认证状态类型
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Context 类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  AUTH: 'interntrack_auth',
  USERS: 'interntrack_users',
};

// 简单的密码哈希（MVP阶段使用，生产环境请使用 bcrypt 等）
const hashPassword = (password: string): string => {
  return btoa(password + 'interntrack_salt'); // 简单加盐
};

// 验证密码
const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// 生成模拟 Token
const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Provider 组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    }
    setIsLoading(false);
  }, []);

  // 保存认证状态到 LocalStorage
  const saveAuthState = (state: AuthState) => {
    setAuthState(state);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(state));
  };

  // 登录
  const login = async (email: string, password: string): Promise<void> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find((u: User & { passwordHash: string }) => u.email === email);

    if (!user) {
      throw new Error('用户不存在');
    }

    if (!verifyPassword(password, user.passwordHash)) {
      throw new Error('密码错误');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    const token = generateToken();

    saveAuthState({
      user: userWithoutPassword,
      isAuthenticated: true,
      token,
    });
  };

  // 注册
  const register = async (email: string, name: string, password: string): Promise<void> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : [];

    // 检查邮箱是否已存在
    if (users.some((u: User) => u.email === email)) {
      throw new Error('该邮箱已注册');
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // 自动登录
    const { passwordHash, ...userWithoutPassword } = newUser;
    const token = generateToken();

    saveAuthState({
      user: userWithoutPassword,
      isAuthenticated: true,
      token,
    });
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
