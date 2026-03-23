import { useState } from 'react';
import { X, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = ['功能建议', 'Bug报告', '其他'] as const;
type FeedbackType = typeof FEEDBACK_TYPES[number];

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [type, setType] = useState<FeedbackType>('功能建议');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    // 延迟重置，避免关闭动画时内容闪烁
    setTimeout(() => {
      setType('功能建议');
      setContent('');
      setContact('');
      setSubmitted(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('feedbacks').insert({
      user_id: user?.id ?? null,
      type,
      content: content.trim(),
      contact: contact.trim() || null,
    });

    setLoading(false);
    if (!error) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-semibold text-gray-900">反馈建议</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-5">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-base font-medium text-gray-900 mb-1">感谢你的反馈</p>
              <p className="text-sm text-gray-500">我会认真阅读每一条建议</p>
              <button
                onClick={handleClose}
                className="mt-6 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                关闭
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">反馈类型</label>
                <div className="flex gap-2">
                  {FEEDBACK_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        type === t
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 反馈内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={
                    type === 'Bug报告'
                      ? '描述一下问题是什么，怎么触发的...'
                      : type === '功能建议'
                      ? '你希望增加什么功能，或者哪里可以做得更好...'
                      : '你想说什么都可以...'
                  }
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 联系方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  联系方式 <span className="text-gray-400 font-normal">（可选，方便回复你）</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="微信号 / 手机号 / 邮箱"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 提交 */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? '提交中...' : '提交反馈'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
