import { useState } from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, name: string, password: string) => Promise<void>;
}

type AuthMode = 'login' | 'register';

export const LoginPage = ({ onLogin, onRegister }: LoginPageProps) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧：品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">实习通</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            管理你的实习投递
            <br />
            记录每一次成长
          </h1>
          <p className="text-primary-100 text-lg">
            系统化记录投递进度，沉淀面经经验，
            <br />
            让求职之路更加清晰高效。
          </p>
        </div>

        <div className="text-sm text-primary-200">
          © 2024 实习通 InternTrack
        </div>
      </div>

      {/* 右侧：表单区域 */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">实习通</span>
          </div>

          {/* 标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="mt-2 text-gray-600">
              {mode === 'login'
                ? '登录以继续管理你的实习投递'
                : '注册开始记录你的求职之旅'}
            </p>
          </div>

          {/* 表单 */}
          {mode === 'login' ? (
            <LoginForm
              onSubmit={onLogin}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSubmit={onRegister}
              onSwitchToLogin={() => setMode('login')}
            />
          )}

          {/* 返回提示 */}
          {mode === 'register' && (
            <button
              onClick={() => setMode('login')}
              className="mt-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              返回登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
