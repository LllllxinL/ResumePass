import { useState } from 'react';
import { Plus, Calendar, Clock, User, Star, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import type { Interview } from '../types';
import { useInterviews } from '../hooks/useApplications';
import { InterviewForm } from './InterviewForm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface InterviewListProps {
  applicationId: string;
}

export const InterviewList = ({ applicationId }: InterviewListProps) => {
  const { interviews, createInterview, updateInterview, deleteInterview, refresh } = useInterviews(applicationId);
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = (data: any) => {
    if (editingInterview) {
      updateInterview(editingInterview.id, data);
      setEditingInterview(null);
    } else {
      createInterview(data);
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这条面经记录吗？')) {
      deleteInterview(id);
    }
  };

  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <div className="border-t border-gray-200 bg-gray-50/50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">
            面经记录
            <span className="ml-2 text-sm text-gray-500">({interviews.length})</span>
          </h4>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              添加面经
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-4">
            <InterviewForm
              applicationId={applicationId}
              initialData={editingInterview || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingInterview(null);
              }}
            />
          </div>
        )}

        {sortedInterviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">暂无面经记录</p>
            <p className="text-xs mt-1">面试后记得记录经验哦～</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                isExpanded={expandedId === interview.id}
                onToggle={() => setExpandedId(expandedId === interview.id ? null : interview.id)}
                onEdit={() => {
                  setEditingInterview(interview);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(interview.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface InterviewCardProps {
  interview: Interview;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const InterviewCard = ({ interview, isExpanded, onToggle, onEdit, onDelete }: InterviewCardProps) => {
  const typeLabels = {
    video: '视频面试',
    phone: '电话面试',
    onsite: '现场面试',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded">
            {interview.roundName}
          </span>
          <span className="text-sm text-gray-500">{typeLabels[interview.interviewType]}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(interview.scheduledDate), 'MM/dd HH:mm', { locale: zhCN })}
          </span>
          {interview.rating && (
            <span className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs">{interview.rating}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          {interview.interviewer && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <User className="w-4 h-4" />
              <span>面试官：{interview.interviewer}</span>
              {interview.interviewerTitle && <span className="text-gray-400">({interview.interviewerTitle})</span>}
            </div>
          )}

          {interview.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4" />
              <span>时长：{interview.duration} 分钟</span>
            </div>
          )}

          {interview.questions && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-1">面试问题</h5>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                {interview.questions}
              </div>
            </div>
          )}

          {interview.notes && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-1">笔记</h5>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                {interview.notes}
              </div>
            </div>
          )}

          {interview.reflections && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-1">复盘总结</h5>
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded whitespace-pre-wrap">
                {interview.reflections}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
