import { useState, useEffect } from 'react';
import type { Application } from '../types';
import { JOB_TYPES, CHANNELS } from '../types';
import { JDParserInput } from './JDParserInput';
import { ResumeGenerator } from './resume/ResumeGenerator';
import { hasAnyExperiences } from '../utils/experienceStorage';
import type { ParsedJobData } from '../utils/jobDescriptionParser';

interface ApplicationFormProps {
  initialData?: Partial<Application>;
  onSubmit: (data: any) => void;
}

export const ApplicationForm = ({ initialData, onSubmit }: ApplicationFormProps) => {
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

  // Handle parsed data from JD parser
  const handleParsedData = (parsedData: Partial<ParsedJobData>) => {
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

  // Resume generator modal state
  const [showResumeGenerator, setShowResumeGenerator] = useState(false);
  const [hasExperiences, setHasExperiences] = useState(false);
  useEffect(() => {
    hasAnyExperiences().then(setHasExperiences);
  }, []);

  const handleApplyResume = (resumeText: string) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes ? `${prev.notes}\n\n【AI生成简历】\n${resumeText}` : `【AI生成简历】\n${resumeText}`
    }));
    setShowResumeGenerator(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Auto-fill Parser - only show for new entries */}
      {isNewEntry && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <JDParserInput onParsed={handleParsedData} disabled={false} />
        </div>
      )}

      {/* 顶部保存按钮 */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          保存
        </button>
      </div>

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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">岗位描述</label>
          {hasExperiences && formData.jobDescription && formData.companyName && formData.jobTitle && (
            <button
              type="button"
              onClick={() => setShowResumeGenerator(true)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>✨</span>
              <span>AI生成定制简历</span>
            </button>
          )}
        </div>
        <textarea
          value={formData.jobDescription}
          onChange={(e) => handleChange('jobDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="复制JD内容到这里..."
        />
        {!hasExperiences && (
          <p className="text-xs text-gray-400 mt-1">
            提示：录入个人经历后可使用AI生成定制简历功能
          </p>
        )}
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


      {/* Resume Generator Modal */}
      {showResumeGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ResumeGenerator
            jobDescription={formData.jobDescription}
            companyName={formData.companyName}
            positionName={formData.jobTitle}
            onApply={handleApplyResume}
            onClose={() => setShowResumeGenerator(false)}
          />
        </div>
      )}
    </form>
  );
};
