import { useState } from 'react';
import { Sparkles, Check, X, ArrowLeft, ArrowRight, SkipForward, Edit2 } from 'lucide-react';
import { TranscriptionView } from './TranscriptionView';

interface AIQuestionExtractorProps {
  transcription: string;
  extractedQuestions: string[];
  onQuestionsSelected: (questions: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const AIQuestionExtractor = ({
  transcription,
  extractedQuestions,
  onQuestionsSelected,
  onBack,
  onSkip,
}: AIQuestionExtractorProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set(extractedQuestions.map((_, i) => i))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  const toggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const startEdit = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditValue(currentText);
  };

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      extractedQuestions[index] = editValue.trim();
    }
    setEditingIndex(null);
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    const selected = [
      ...Array.from(selectedQuestions).map(i => extractedQuestions[i]),
      ...customQuestions,
    ];
    onQuestionsSelected(selected);
  };

  const hasSelected = selectedQuestions.size > 0 || customQuestions.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          AI 已提取面试问题
        </h3>
        <p className="text-sm text-gray-500">
          选择需要使用的问题，也可以编辑或添加新问题
        </p>
      </div>

      {/* 转录文本折叠区 */}
      <TranscriptionView transcription={transcription} />

      {/* 提取的问题列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            提取的问题
            <span className="ml-2 text-xs text-gray-400">
              ({selectedQuestions.size}/{extractedQuestions.length} 已选择)
            </span>
          </h4>
          <button
            onClick={() => setSelectedQuestions(new Set(extractedQuestions.map((_, i) => i)))}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            全选
          </button>
        </div>

        <div className="space-y-2">
          {extractedQuestions.map((question, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                selectedQuestions.has(index)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 opacity-60'
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  selectedQuestions.has(index)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedQuestions.has(index) && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(index)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800">{question}</p>
                    <button
                      onClick={() => startEdit(index, question)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 添加自定义问题 */}
        <div className="pt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">添加新问题</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomQuestion()}
              placeholder="输入面试官提出的问题..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={addCustomQuestion}
              disabled={!newQuestion.trim()}
              className="px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50"
            >
              添加
            </button>
          </div>

          {/* 自定义问题列表 */}
          {customQuestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {customQuestions.map((question, index) => (
                <div
                  key={`custom-${index}`}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="flex-1 text-sm text-gray-800">{question}</span>
                  <button
                    onClick={() => removeCustomQuestion(index)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          重新上传
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <SkipForward className="w-4 h-4" />
            跳过
          </button>

          <button
            onClick={handleContinue}
            disabled={!hasSelected}
            className={`
              flex items-center gap-1.5 px-6 py-2 rounded-lg text-sm font-medium
              ${hasSelected
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
