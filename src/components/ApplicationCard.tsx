import { useState } from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink, MoreVertical, Edit2, Trash2, MessageSquare } from 'lucide-react';
import type { Application } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { InterviewList } from './InterviewList';

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Application['status']) => void;
}

export const ApplicationCard = ({ application, onEdit, onDelete, onStatusChange }: ApplicationCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showInterviews, setShowInterviews] = useState(false);
  const status = STATUS_CONFIG[application.status];
  const priority = PRIORITY_CONFIG[application.priority];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* 头部：公司和岗位 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{application.companyName}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Briefcase className="w-3.5 h-3.5" />
              {application.jobTitle}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => { onEdit(application); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => { onDelete(application.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 状态标签 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.bgColor} ${status.color} ${status.borderColor}`}>
            {status.label}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.color}`}>
            {priority.label}优先级
          </span>
          {application.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* 详情信息 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
          {application.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {application.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(application.applyDate), 'MM/dd', { locale: zhCN })}
          </span>
          {application.salaryRange && (
            <span className="text-green-600 font-medium">{application.salaryRange}</span>
          )}
        </div>

        {/* 快捷状态更新 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">更新状态：</span>
          <div className="flex gap-1">
            {['applied', 'screening', 'interview', 'offer', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(application.id, s as Application['status'])}
                className={`w-6 h-6 rounded-full text-[10px] font-medium transition-all ${
                  application.status === s
                    ? STATUS_CONFIG[s as Application['status']].bgColor + ' ' + STATUS_CONFIG[s as Application['status']].color
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={STATUS_CONFIG[s as Application['status']].label}
              >
                {STATUS_CONFIG[s as Application['status']].label.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInterviews(!showInterviews)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              面经
            </button>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                JD链接
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 面试记录展开区 */}
      {showInterviews && (
        <InterviewList
          applicationId={application.id}
        />
      )}
    </div>
  );
};
