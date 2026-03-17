import { Briefcase, MapPin, Calendar, DollarSign, Tag, Link2, Building2, ExternalLink } from 'lucide-react';
import type { Application } from '../../types';
import { STATUS_CONFIG, STATUS_ORDER, PRIORITY_CONFIG, JOB_TYPES, CHANNELS } from '../../types';

interface ApplicationInfoPanelProps {
  application: Application;
  isEditing: boolean;
  onFieldChange: (field: keyof Application, value: any) => void;
  onStatusChange: (status: Application['status']) => void;
}

export const ApplicationInfoPanel = ({
  application,
  isEditing,
  onFieldChange,
  onStatusChange,
}: ApplicationInfoPanelProps) => {
  const priority = PRIORITY_CONFIG[application.priority];

  if (isEditing) {
    return (
      <div className="space-y-5">
        {/* 公司名和岗位 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              公司名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={application.companyName}
              onChange={(e) => onFieldChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              岗位名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={application.jobTitle}
              onChange={(e) => onFieldChange('jobTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 状态快速切换 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">当前进度</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => {
              const config = STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    application.status === status
                      ? `${config.bgColor} ${config.color} ${config.borderColor}`
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 基本信息网格 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">岗位类型</label>
            <select
              value={application.jobType}
              onChange={(e) => onFieldChange('jobType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">投递渠道</label>
            <select
              value={application.channel}
              onChange={(e) => onFieldChange('channel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {CHANNELS.map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">工作城市</label>
            <input
              type="text"
              value={application.city || ''}
              onChange={(e) => onFieldChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="如：北京"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">薪资范围</label>
            <input
              type="text"
              value={application.salaryRange || ''}
              onChange={(e) => onFieldChange('salaryRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="如：300-400/天"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">投递日期</label>
            <input
              type="date"
              value={application.applyDate}
              onChange={(e) => onFieldChange('applyDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
            <select
              value={application.priority}
              onChange={(e) => onFieldChange('priority', e.target.value as Application['priority'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">标签（用逗号分隔）</label>
          <input
            type="text"
            value={application.tags.join(', ')}
            onChange={(e) => onFieldChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="如：大厂, 心仪, 备胎"
          />
        </div>

        {/* 投递链接 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">投递链接</label>
          <input
            type="url"
            value={application.jobUrl || ''}
            onChange={(e) => onFieldChange('jobUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="https://..."
          />
        </div>

        {/* JD描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">岗位描述（JD）</label>
          <textarea
            value={application.jobDescription || ''}
            onChange={(e) => onFieldChange('jobDescription', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="复制JD内容到这里..."
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <textarea
            value={application.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="其他需要记录的信息..."
          />
        </div>
      </div>
    );
  }

  // 只读模式
  return (
    <div className="space-y-6">
      {/* 公司/岗位标题区 */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900">{application.companyName}</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>{application.jobTitle}</span>
        </div>
      </div>

      {/* 关键信息卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon={<MapPin className="w-4 h-4" />}
          label="工作城市"
          value={application.city || '未填写'}
        />
        <InfoCard
          icon={<DollarSign className="w-4 h-4" />}
          label="薪资范围"
          value={application.salaryRange || '未填写'}
          valueClassName={application.salaryRange ? 'text-green-600' : 'text-gray-400'}
        />
        <InfoCard
          icon={<Calendar className="w-4 h-4" />}
          label="投递日期"
          value={application.applyDate}
        />
        <InfoCard
          icon={<Tag className="w-4 h-4" />}
          label="岗位类型"
          value={application.jobType}
        />
      </div>

      {/* 渠道和优先级 */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <span className="text-sm text-gray-500">投递渠道</span>
          <p className="font-medium text-gray-900 mt-0.5">{application.channel}</p>
        </div>
        <div className="flex-1">
          <span className="text-sm text-gray-500">优先级</span>
          <span className={`inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded ${priority.color}`}>
            {priority.label}
          </span>
        </div>
      </div>

      {/* 标签 */}
      {application.tags.length > 0 && (
        <div>
          <span className="text-sm text-gray-500 block mb-2">标签</span>
          <div className="flex flex-wrap gap-2">
            {application.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 投递链接 */}
      {application.jobUrl && (
        <div>
          <span className="text-sm text-gray-500 block mb-1.5">投递链接</span>
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm"
          >
            <Link2 className="w-4 h-4" />
            查看原岗位信息
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* JD描述 */}
      {application.jobDescription && (
        <div>
          <span className="text-sm text-gray-500 block mb-2">岗位描述</span>
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
            {application.jobDescription}
          </div>
        </div>
      )}

      {/* 备注 */}
      {application.notes && (
        <div>
          <span className="text-sm text-gray-500 block mb-2">备注</span>
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-gray-700">
            {application.notes}
          </div>
        </div>
      )}

      {/* 创建时间 */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          创建于 {new Date(application.createdAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

const InfoCard = ({ icon, label, value, valueClassName = '' }: InfoCardProps) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div>
      <span className="text-xs text-gray-500 block">{label}</span>
      <span className={`text-sm font-medium ${valueClassName || 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  </div>
);
