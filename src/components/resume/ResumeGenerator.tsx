import { useState, useEffect } from 'react';
import { generateResumeWithCoze, hasExperiences, type CozeWorkflowResult, type UserExperiences } from '../../services/cozeApi';
import { getAllExperiences } from '../../utils/experienceStorage';

interface ResumeGeneratorProps {
  jobDescription: string;
  companyName: string;
  positionName: string;
  onApply: (resumeText: string) => void;
  onClose: () => void;
}

export const ResumeGenerator = ({ jobDescription, companyName, positionName, onApply, onClose }: ResumeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'generating' | 'result'>('confirm');
  const [result, setResult] = useState<CozeWorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [experiences, setExperiencesData] = useState<UserExperiences>({ internships: [], projects: [], campus: [], skills: [] });
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    getAllExperiences().then(exp => {
      setExperiencesData(exp);
      setHasData(hasExperiences(exp));
    });
  }, []);

  const handleGenerate = async () => {
    if (!hasData) {
      setError('请先录入个人经历');
      return;
    }

    setLoading(true);
    setStep('generating');
    setError(null);

    try {
      const data = await generateResumeWithCoze(
        experiences,
        jobDescription,
        companyName,
        positionName
      );
      setResult(data);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.resume_text) {
      navigator.clipboard.writeText(result.resume_text);
      alert('已复制到剪贴板');
    }
  };

  // 确认页面
  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">AI 生成定制简历</h3>

        {!hasData ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">你还没有录入个人经历</p>
            <p className="text-sm text-gray-400">请先录入经历后再使用此功能</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">目标岗位：</span>{companyName} - {positionName}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                将根据你的 {experiences.internships.length} 条实习、{experiences.projects.length} 个项目、{experiences.campus.length} 条校园经历自动生成定制简历
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '开始生成'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 生成中页面
  if (step === 'generating') {
    return (
      <div className="bg-white rounded-lg p-8 max-w-lg w-full text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">AI 正在生成简历...</h3>
        <p className="text-sm text-gray-500">正在分析JD、匹配经历、优化表述</p>
      </div>
    );
  }

  // 结果页面
  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
      <h3 className="text-lg font-semibold mb-4">AI 生成的定制简历</h3>

      {result && (
        <div className="space-y-4">
          {/* 生成的简历文本 */}
          <div>
            <h4 className="font-medium text-sm mb-2">简历内容</h4>
            {result.resume_text ? (
              <textarea
                value={result.resume_text}
                readOnly
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                <p className="font-medium mb-1">工作流返回数据结构异常</p>
                <p className="text-xs">请打开浏览器 Console（F12）查看 [Coze] 日志，将内容发给开发者排查。</p>
                <pre className="mt-2 text-xs overflow-auto max-h-32 bg-white p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              复制文本
            </button>
            <button
              onClick={() => onApply(result.resume_text)}
              className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              用于此投递
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
