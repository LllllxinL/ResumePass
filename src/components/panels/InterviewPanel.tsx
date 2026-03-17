import { useState } from 'react';
import { Plus, Calendar, Clock, User, Star, ChevronDown, ChevronUp, Edit2, Trash2, Mic, FileText, Sparkles } from 'lucide-react';
import type { Application, Interview } from '../../types';
import { useInterviews } from '../../hooks/useApplications';
import { InterviewWizard } from '../interview/InterviewWizard';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface InterviewPanelProps {
  applicationId: string;
  application: Application;
}

export const InterviewPanel = ({ applicationId, application }: InterviewPanelProps) => {
  const { interviews, createInterview, updateInterview, deleteInterview, refresh } = useInterviews(applicationId);
  const [showWizard, setShowWizard] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const handleSaveInterview = (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingInterview) {
      updateInterview(editingInterview.id, data);
      setEditingInterview(null);
    } else {
      createInterview(data);
    }
    setShowWizard(false);
    refresh();
  };

  const handleDeleteInterview = (id: string) => {
    if (confirm('确定删除这条面经记录吗？')) {
      deleteInterview(id);
    }
  };

  // 显示面经创建向导
  if (showWizard) {
    return (
      <InterviewWizard
        applicationId={applicationId}
        initialData={editingInterview || undefined}
        onSave={handleSaveInterview}
        onCancel={() => {
          setShowWizard(false);
          setEditingInterview(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            面经记录
            <span className="ml-2 text-sm font-normal text-gray-500">({interviews.length})</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {application.companyName} · {application.jobTitle}
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加面经
        </button>
      </div>

      {/* 面经列表 */}
      {sortedInterviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-base font-medium text-gray-900 mb-1">暂无面经记录</h4>
          <p className="text-sm text-gray-500 mb-4">面试后记得记录经验，支持录音转文字哦～</p>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            添加第一条面经
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedInterviews.map((interview, index) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              index={index}
              isExpanded={expandedId === interview.id}
              onToggle={() => setExpandedId(expandedId === interview.id ? null : interview.id)}
              onEdit={() => {
                setEditingInterview(interview);
                setShowWizard(true);
              }}
              onDelete={() => handleDeleteInterview(interview.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface InterviewCardProps {
  interview: Interview;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const InterviewCard = ({ interview, index, isExpanded, onToggle, onEdit, onDelete }: InterviewCardProps) => {
  const typeLabels = {
    video: '视频面试',
    phone: '电话面试',
    onsite: '现场面试',
  };

  const roundColors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-pink-100 text-pink-700',
    'bg-orange-100 text-orange-700',
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      {/* Card Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* 轮次标记 */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${roundColors[index % roundColors.length]}`}>
            {interview.round}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{interview.roundName}</span>
              <span className="text-xs text-gray-500">{typeLabels[interview.interviewType]}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(interview.scheduledDate), 'MM/dd HH:mm', { locale: zhCN })}
              </span>
              {interview.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {interview.duration}分钟
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {interview.rating && (
            <div className="flex items-center gap-0.5 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < interview.rating! ? 'fill-current' : 'text-gray-200'}`}
                />
              ))}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* 面试官信息 */}
          {(interview.interviewer || interview.interviewerTitle) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 py-3">
              <User className="w-4 h-4 text-gray-400" />
              <span>面试官：</span>
              {interview.interviewer && <span className="font-medium">{interview.interviewer}</span>}
              {interview.interviewerTitle && (
                <span className="text-gray-500">({interview.interviewerTitle})</span>
              )}
            </div>
          )}

          {/* 转录文本（如果有） */}
          {interview.transcription && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mic className="w-4 h-4" />
                录音转录
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 max-h-40 overflow-y-auto">
                {interview.transcription}
              </div>
            </div>
          )}

          {/* 面试问题 */}
          {interview.questions && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                面试问题
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {interview.questions}
              </div>
            </div>
          )}

          {/* 笔记 */}
          {interview.notes && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                我的回答/笔记
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {interview.notes}
              </div>
            </div>
          )}

          {/* 复盘总结 */}
          {interview.reflections && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                复盘总结
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {interview.reflections}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
