import { useState } from 'react';
import type { Interview } from '../types';

interface InterviewFormProps {
  applicationId: string;
  initialData?: Partial<Interview>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const InterviewForm = ({ applicationId, initialData, onSubmit, onCancel }: InterviewFormProps) => {
  const [formData, setFormData] = useState({
    round: initialData?.round || 1,
    roundName: initialData?.roundName || '一面',
    interviewType: initialData?.interviewType || 'video',
    interviewer: initialData?.interviewer || '',
    interviewerTitle: initialData?.interviewerTitle || '',
    scheduledDate: initialData?.scheduledDate || new Date().toISOString().slice(0, 16),
    duration: initialData?.duration || 30,
    notes: initialData?.notes || '',
    questions: initialData?.questions || '',
    reflections: initialData?.reflections || '',
    rating: initialData?.rating || 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      applicationId,
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const roundOptions = [
    { value: 1, label: '一面' },
    { value: 2, label: '二面' },
    { value: 3, label: '三面' },
    { value: 4, label: 'HR面' },
    { value: 5, label: '终面' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试轮次</label>
          <select
            value={formData.round}
            onChange={(e) => {
              const round = parseInt(e.target.value);
              handleChange('round', round);
              handleChange('roundName', roundOptions.find(r => r.value === round)?.label || '一面');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {roundOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试形式</label>
          <select
            value={formData.interviewType}
            onChange={(e) => handleChange('interviewType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="video">视频面试</option>
            <option value="phone">电话面试</option>
            <option value="onsite">现场面试</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试官姓名</label>
          <input
            type="text"
            value={formData.interviewer}
            onChange={(e) => handleChange('interviewer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="如：张经理"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试官职位</label>
          <input
            type="text"
            value={formData.interviewerTitle}
            onChange={(e) => handleChange('interviewerTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="如：前端负责人"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试日期时间</label>
          <input
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => handleChange('scheduledDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">面试时长（分钟）</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          面试问题
          <span className="text-xs text-gray-500 font-normal ml-2">记录面试官提出的问题</span>
        </label>
        <textarea
          value={formData.questions}
          onChange={(e) => handleChange('questions', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="1. 请做一下自我介绍&#10;2. ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          我的回答/笔记
          <span className="text-xs text-gray-500 font-normal ml-2">记录你的回答要点和面试中的关键信息</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="面试过程中的笔记..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          复盘总结
          <span className="text-xs text-gray-500 font-normal ml-2">面试后的反思，哪些做得好，哪些需要改进</span>
        </label>
        <textarea
          value={formData.reflections}
          onChange={(e) => handleChange('reflections', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="## 回答得好的地方&#10;- &#10;&#10;## 需要改进的地方&#10;- &#10;&#10;## 行动计划&#10;- "
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">自我评分</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleChange('rating', star)}
              className={`w-8 h-8 rounded-full text-lg transition-colors ${
                star <= formData.rating
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating === 1 && '很差'}
            {formData.rating === 2 && '较差'}
            {formData.rating === 3 && '一般'}
            {formData.rating === 4 && '良好'}
            {formData.rating === 5 && '优秀'}
          </span>
        </div>
      </div>

      {/* 录音上传区域 - MVP简化版 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">面试录音</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500">
            <p className="text-sm">MVP版本暂不支持录音上传</p>
            <p className="text-xs mt-1">请在笔记中手动记录关键信息</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
        >
          保存面经
        </button>
      </div>
    </form>
  );
};
