import { useState } from 'react';
import { ArrowLeft, Save, Plus, X, Mic } from 'lucide-react';
import type { Interview } from '../../types';

interface InterviewFormProps {
  initialData: Partial<Interview>;
  onSubmit: (data: Partial<Interview>) => void;
  onCancel: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
}

export const InterviewForm = ({
  initialData,
  onSubmit,
  onCancel,
  showBackButton,
  onBack,
}: InterviewFormProps) => {
  // 解析初始问题
  const parseInitialQuestions = (): QuestionItem[] => {
    if (initialData.questions) {
      return initialData.questions.split('\n\n').filter(q => q.trim()).map((q, i) => ({
        id: `q-${i}`,
        question: q.trim(),
        answer: '',
      }));
    }
    return [];
  };

  const [formData, setFormData] = useState({
    round: initialData.round || 1,
    roundName: initialData.roundName || '一面',
    interviewType: initialData.interviewType || 'video',
    interviewer: initialData.interviewer || '',
    interviewerTitle: initialData.interviewerTitle || '',
    scheduledDate: initialData.scheduledDate || new Date().toISOString().slice(0, 16),
    duration: initialData.duration || 30,
    reflections: initialData.reflections || '',
    rating: initialData.rating || 3,
    transcription: initialData.transcription || '',
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(parseInitialQuestions());

  const roundOptions = [
    { value: 1, label: '一面' },
    { value: 2, label: '二面' },
    { value: 3, label: '三面' },
    { value: 4, label: 'HR面' },
    { value: 5, label: '终面' },
  ];

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), question: '', answer: '' }]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: 'question' | 'answer', value: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const questionsText = questions
      .filter(q => q.question.trim())
      .map(q => q.question)
      .join('\n\n');

    const notesText = questions
      .filter(q => q.question.trim() && q.answer.trim())
      .map(q => `Q: ${q.question}\nA: ${q.answer}`)
      .join('\n\n---\n\n');

    onSubmit({
      ...formData,
      questions: questionsText,
      notes: notesText,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">完善面经</h3>
        <p className="text-sm text-gray-500">补充面试细节和你的回答</p>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试轮次</label>
          <select
            value={formData.round}
            onChange={(e) => {
              const round = parseInt(e.target.value);
              setFormData({
                ...formData,
                round,
                roundName: roundOptions.find(r => r.value === round)?.label || '一面',
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {roundOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试形式</label>
          <select
            value={formData.interviewType}
            onChange={(e) => setFormData({ ...formData, interviewType: e.target.value as Interview['interviewType'] })}
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试官姓名</label>
          <input
            type="text"
            value={formData.interviewer}
            onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="如：张经理"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试官职位</label>
          <input
            type="text"
            value={formData.interviewerTitle}
            onChange={(e) => setFormData({ ...formData, interviewerTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="如：前端负责人"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试日期时间</label>
          <input
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">面试时长（分钟）</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 转录提示 */}
      {formData.transcription && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <Mic className="w-4 h-4" />
          <span>已保存录音转录文本，可在面经详情中查看</span>
        </div>
      )}

      {/* 面试问题与回答 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">面试问题与回答</label>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            添加问题
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2 mb-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                  placeholder="面试官提出的问题..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={q.answer}
                onChange={(e) => handleQuestionChange(q.id, 'answer', e.target.value)}
                placeholder="你的回答要点..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}

          {questions.length === 0 && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              添加面试问题
            </button>
          )}
        </div>
      </div>

      {/* 复盘总结 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">复盘总结</label>
        <textarea
          value={formData.reflections}
          onChange={(e) => setFormData({ ...formData, reflections: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="## 回答得好的地方&#10;- &#10;&#10;## 需要改进的地方&#10;- &#10;&#10;## 行动计划&#10;- "
        />
      </div>

      {/* 自我评分 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">自我评分</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={`w-10 h-10 rounded-lg text-lg transition-colors ${
                star <= formData.rating
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
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

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
        </div>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          保存面经
        </button>
      </div>
    </form>
  );
};
