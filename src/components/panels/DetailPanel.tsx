import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, FileText, MessageSquare } from 'lucide-react';
import type { Application } from '../../types';
import { STATUS_CONFIG } from '../../types';
import { ApplicationInfoPanel } from './ApplicationInfoPanel';
import { InterviewPanel } from './InterviewPanel';

interface DetailPanelProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Application['status']) => void;
}

type TabType = 'info' | 'interviews';

export const DetailPanel = ({
  application,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: DetailPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedApp, setEditedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (application) {
      setEditedApp({ ...application });
      setIsEditing(false);
    }
  }, [application]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !application || !editedApp) return null;

  const handleSave = () => {
    if (editedApp) {
      onEdit(editedApp);
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field: keyof Application, value: any) => {
    setEditedApp(prev => prev ? { ...prev, [field]: value } : null);
  };

  const status = STATUS_CONFIG[application.status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {application.companyName}
            </h2>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            基本信息
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'interviews'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            面经记录
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <ApplicationInfoPanel
              application={editedApp}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
              onStatusChange={(status) => onStatusChange(application.id, status)}
            />
          ) : (
            <InterviewPanel
              applicationId={application.id}
              application={application}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          {activeTab === 'info' && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditedApp({ ...application });
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
              )}
            </div>
          )}

          {activeTab === 'interviews' && <div />}

          <button
            onClick={() => {
              if (confirm('确定删除这条投递记录吗？')) {
                onDelete(application.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>
    </>
  );
};
