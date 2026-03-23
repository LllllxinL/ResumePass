import { useState } from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle, Sparkles, Building2, Briefcase, MapPin, Tag, DollarSign } from 'lucide-react';
import { parseJobDescription, isValidJobDescription, type ParsedJobData } from '../utils/jobDescriptionParser';

interface JDParserInputProps {
  onParsed: (data: Partial<ParsedJobData>) => void;
  disabled?: boolean;
}

export const JDParserInput = ({ onParsed, disabled }: JDParserInputProps) => {
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedJobData | null>(null);

  const handleTextChange = (value: string) => {
    setJdText(value);
    setError(null);
    // 清除之前的解析结果
    if (parsedData) {
      setParsedData(null);
    }
  };

  const handleParse = async () => {
    if (!jdText.trim()) {
      setError('请输入岗位描述内容');
      return;
    }

    if (jdText.trim().length < 20) {
      setError('岗位描述内容太短，请提供更详细的JD文本');
      return;
    }

    setIsParsing(true);
    setError(null);
    setParsedData(null);

    try {
      const data = await parseJobDescription(jdText.trim());
      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败，请重试');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parsedData) {
      onParsed(parsedData);
    }
  };

  // 示例JD文本
  const exampleJD = `【公司名称】字节跳动
【职位名称】产品经理实习生
【工作地点】北京

【岗位职责】
1. 参与抖音电商产品功能策划，协助完成需求分析
2. 收集用户反馈，进行数据分析和用户调研
3. 撰写PRD文档，跟进产品开发进度
4. 与设计、开发、运营团队紧密配合，推动功能上线

【任职要求】
1. 本科及以上学历，计算机、产品设计等相关专业优先
2. 对产品有热情，逻辑思维清晰
3. 良好的沟通协调能力，有团队合作精神
4. 有互联网产品实习经验优先
5. 每周至少实习4天，实习3个月以上

【薪资福利】
- 薪资：300-400/天
- 三餐免费，零食饮料不限量
- 扁平化管理，快速学习成长`;

  const loadExample = () => {
    setJdText(exampleJD);
    setError(null);
    setParsedData(null);
  };

  return (
    <div className="space-y-4">
      {/* 输入区域 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            粘贴岗位JD描述
            <span className="text-gray-400 font-normal ml-1">(AI自动提取信息)</span>
          </label>
          <button
            type="button"
            onClick={loadExample}
            disabled={disabled || isParsing}
            className="text-xs text-primary-600 hover:text-primary-700 underline"
          >
            加载示例
          </button>
        </div>

        <textarea
          value={jdText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={disabled || isParsing}
          rows={8}
          placeholder="请将招聘网站上的完整职位描述粘贴到这里，包括：&#10;- 公司名称&#10;- 岗位名称&#10;- 岗位职责&#10;- 任职要求&#10;- 工作地点&#10;- 薪资范围（如果有）&#10;&#10;AI会自动分析并提取关键信息..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors ${
            error ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
          }`}
        />

        {/* 提示和字符计数 */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            💡 建议从 BOSS直聘/实习僧网页版复制完整JD，App可能复制不全
          </span>
          <span className="text-xs text-gray-400">
            {jdText.length} 字符
          </span>
          {isValidJobDescription(jdText) && !parsedData && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              检测到JD内容
            </span>
          )}
        </div>
      </div>

      {/* 解析按钮 */}
      {!parsedData && (
        <button
          type="button"
          onClick={handleParse}
          disabled={!jdText.trim() || isParsing || disabled}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI分析中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>✨ AI智能解析</span>
            </>
          )}
        </button>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}

      {/* 解析结果预览 */}
      {parsedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>AI提取结果预览</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">公司：</span>
              <span className="font-medium text-gray-800">{parsedData.companyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">岗位：</span>
              <span className="font-medium text-gray-800">{parsedData.jobTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">类型：</span>
              <span className="font-medium text-gray-800">{parsedData.jobType}</span>
            </div>

            {parsedData.city && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">城市：</span>
                <span className="font-medium text-gray-800">{parsedData.city}</span>
              </div>
            )}

            {parsedData.salaryRange && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">薪资：</span>
                <span className="font-medium text-gray-800">{parsedData.salaryRange}</span>
              </div>
            )}

            {parsedData.tags.length > 0 && (
              <div className="flex items-center gap-2 col-span-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">标签：</span>
                <div className="flex flex-wrap gap-1">
                  {parsedData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-white text-xs text-gray-600 rounded border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              确认填充到表单
            </button>
            <button
              type="button"
              onClick={() => setParsedData(null)}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重新解析
            </button>
          </div>

          <p className="text-xs text-gray-500">
            💡 提示：确认后仍可手动修改表单中的任何字段
          </p>
        </div>
      )}
    </div>
  );
};
