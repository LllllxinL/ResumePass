import { useState } from 'react';
import type { Application } from '../types';
import { JOB_TYPES, CHANNELS } from '../types';
import { UrlParserInput } from './UrlParserInput';
import { JDParserInput } from './JDParserInput';
import type { ParsedJobData } from '../utils/urlParser';
import type { ParsedJobData as JDParsedJobData } from '../utils/jobDescriptionParser';

interface ApplicationFormProps {
  initialData?: Partial<Application>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ApplicationForm = ({ initialData, onSubmit, onCancel }: ApplicationFormProps) => {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    jobTitle: initialData?.jobTitle || '',
    jobType: initialData?.jobType || '技术',
    city: initialData?.city || '',
    salaryRange: initialData?.salaryRange || '',
    channel: initialData?.channel || 'BOSS直聘',
    jobUrl: initialData?.jobUrl || '',
    applyDate: initialData?.applyDate || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'applied',
    priority: initialData?.priority || 'medium',
    tags: initialData?.tags?.join(', ') || '',
    jobDescription: initialData?.jobDescription || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tab state for parser selection
  const [activeParserTab, setActiveParserTab] = useState<'url' | 'jd'>('url');

  // Handle parsed data from URL parser or JD parser
  const handleParsedData = (parsedData: Partial<ParsedJobData> | Partial<JDParsedJobData>) => {
    setFormData(prev => ({
      ...prev,
      // Only override if the field is empty or if it's a new entry
      companyName: parsedData.companyName || prev.companyName,
      jobTitle: parsedData.jobTitle || prev.jobTitle,
      jobType: parsedData.jobType || prev.jobType,
      city: parsedData.city || prev.city,
      salaryRange: parsedData.salaryRange || prev.salaryRange,
      channel: parsedData.channel || prev.channel,
      jobUrl: parsedData.jobUrl || prev.jobUrl,
      jobDescription: parsedData.jobDescription || prev.jobDescription,
      tags: parsedData.tags?.join(', ') || prev.tags,
    }));
  };

  // Check if this is a new entry (not editing)
  const isNewEntry = !initialData?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Auto-fill Parser - only show for new entries */}
      {isNewEntry && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveParserTab('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeParserTab === 'url'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              🔗 粘贴链接解析
            </button>
            <button
              type="button"
              onClick={() => setActiveParserTab('jd')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeParserTab === 'jd'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📝 粘贴JD文本
            </button>
          </div>

          {/* Tab Content */}
          {activeParserTab === 'url' ? (
            <UrlParserInput
              onParsed={handleParsedData}
              disabled={false}
            />
          ) : (
            <JDParserInput
              onParsed={handleParsedData}
              disabled={false}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            公司名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="如：字节跳动"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            岗位名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="如：前端开发实习生"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">岗位类型</label>
          <select
            value={formData.jobType}
            onChange={(e) => handleChange('jobType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {JOB_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">投递渠道</label>
          <select
            value={formData.channel}
            onChange={(e) => handleChange('channel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {CHANNELS.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">投递日期</label>
          <input
            type="date"
            value={formData.applyDate}
            onChange={(e) => handleChange('applyDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">工作城市</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="如：北京"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">薪资范围</label>
          <input
            type="text"
            value={formData.salaryRange}
            onChange={(e) => handleChange('salaryRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="如：300-400/天"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">投递链接</label>
        <input
          type="url"
          value={formData.jobUrl}
          onChange={(e) => handleChange('jobUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="如：大厂, 心仪, 备胎"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">岗位描述</label>
        <textarea
          value={formData.jobDescription}
          onChange={(e) => handleChange('jobDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="复制JD内容到这里..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="其他需要记录的信息..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
};
