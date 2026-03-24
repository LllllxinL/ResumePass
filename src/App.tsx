import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, BarChart3, Search, Trash2, MessageSquare, X } from 'lucide-react';
import { ApplicationForm } from './components/ApplicationForm';
import { KanbanBoard } from './components/KanbanBoard';
import { Statistics } from './components/Statistics';
import { DetailPanel } from './components/panels/DetailPanel';
import { Modal } from './components/Modal';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginPage } from './components/pages/LoginPage';
import { UserMenu } from './components/auth/UserMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useApplications } from './hooks/useApplications';
import { applicationStorage } from './utils/storage';
import { ProfilePage } from './components/pages/ProfilePage';
import { InterviewsPage } from './components/pages/InterviewsPage';
import type { Application } from './types';

type ViewMode = 'kanban' | 'stats' | 'profile' | 'interviews';

// 主应用内容组件
const MainApp = () => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { applications, createApplication, updateApplication, deleteApplication, refresh } = useApplications();

  // 生成示例数据（仅在登录后执行一次）
  useEffect(() => {
    if (user) {
      applicationStorage.generateDemoData().then(() => refresh());
    }
  }, [user, refresh]);

  // 过滤投递记录
  const filteredApps = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    return (
      app.companyName.toLowerCase().includes(search) ||
      app.jobTitle.toLowerCase().includes(search) ||
      app.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });

  const handleSubmit = (data: any) => {
    if (editingApp) {
      updateApplication(editingApp.id, data);
      setEditingApp(null);
    } else {
      createApplication(data);
    }
    setIsModalOpen(false);
  };

  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
    setIsPanelOpen(true);
  };

  const handlePanelEdit = (app: Application) => {
    updateApplication(app.id, app);
    setSelectedApp(app);
  };

  const handlePanelDelete = (id: string) => {
    deleteApplication(id);
    setSelectedApp(null);
    setIsPanelOpen(false);
  };

  const handleStatusChange = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status });
    }
  };

  const clearAllData = async () => {
    if (confirm('确定清空所有数据吗？此操作不可恢复！')) {
      await applicationStorage.clear();
      await refresh();
      setIsPanelOpen(false);
      setSelectedApp(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">简历通</h1>
              <span className="text-xs text-gray-400 hidden sm:inline">ResumePass</span>
            </div>

            {/* View Switcher - 仅桌面端显示 */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                看板
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'stats'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                统计
              </button>
              <button
                onClick={() => setViewMode('interviews')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'interviews'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                面经
              </button>
            </div>

            <div className="flex items-center gap-2">
              {viewMode !== 'stats' && viewMode !== 'interviews' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 md:px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">新增投递</span>
                </button>
              )}
              {/* 用户菜单 */}
              {user && <UserMenu user={user} onLogout={logout} onOpenProfile={() => setViewMode('profile')} onOpenFeedback={() => setIsFeedbackOpen(true)} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {viewMode === 'stats' ? (
          <Statistics />
        ) : viewMode === 'profile' ? (
          <ProfilePage />
        ) : viewMode === 'interviews' ? (
          <InterviewsPage />
        ) : (
          <>
            {/* 搜索栏 */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索公司、岗位或标签..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  共 {filteredApps.length} 条
                </span>
                <button
                  onClick={clearAllData}
                  className="flex items-center gap-1 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="清空所有数据"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">清空数据</span>
                </button>
              </div>
            </div>

            {/* 看板视图 */}
            <KanbanBoard
              applications={filteredApps}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </main>

      {/* Detail Panel */}
      <DetailPanel
        application={selectedApp}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedApp(null);
        }}
        onEdit={handlePanelEdit}
        onDelete={handlePanelDelete}
        onStatusChange={handleStatusChange}
      />

      {/* Bottom Navigation - 仅移动端显示 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 md:hidden">
        <div className="flex">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              viewMode === 'kanban' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            看板
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              viewMode === 'stats' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            统计
          </button>
          <button
            onClick={() => setViewMode('interviews')}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              viewMode === 'interviews' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            面经
          </button>
        </div>
      </nav>

      {/* Add Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        title={editingApp ? '编辑投递记录' : '新增投递记录'}
        size="lg"
      >
        <ApplicationForm
          initialData={editingApp || undefined}
          onSubmit={handleSubmit}
        />
      </Modal>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

// 应用根组件
function App() {
  const { isAuthenticated, isLoading, login, register } = useAuth();

  // 加载中显示空白或加载动画
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 未登录显示登录页面
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }

  // 已登录显示主应用
  return <MainApp />;
}

// 包装 AuthProvider 的导出
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
