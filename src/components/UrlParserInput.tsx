import { useState } from 'react';
import { Link2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { parseJobUrl, isValidJobUrl, detectPlatform, type ParsedJobData } from '../utils/urlParser';

interface UrlParserInputProps {
  onParsed: (data: Partial<ParsedJobData>) => void;
  disabled?: boolean;
}

export const UrlParserInput = ({ onParsed, disabled }: UrlParserInputProps) => {
  const [url, setUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    setSuccess(false);

    // Auto-detect platform as user types
    if (isValidJobUrl(value)) {
      const platform = detectPlatform(value);
      if (platform !== 'unknown') {
        setDetectedPlatform(platform === 'shixiseng' ? '实习僧' : 'BOSS直聘');
      } else {
        setDetectedPlatform(null);
      }
    } else {
      setDetectedPlatform(null);
    }
  };

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入职位链接');
      return;
    }

    if (!isValidJobUrl(url.trim())) {
      setError('请输入有效的URL链接');
      return;
    }

    setIsParsing(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await parseJobUrl(url.trim());
      onParsed(data);
      setSuccess(true);

      // Clear success indicator after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败，请重试');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle paste event for auto-trigger
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (isValidJobUrl(pastedText)) {
      // Auto-trigger after a short delay to let the paste complete
      setTimeout(() => {
        handleUrlChange(pastedText);
        // Don't auto-parse on paste to give user a chance to review
      }, 100);
    }
  };

  // Handle Enter key to trigger parse
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isParsing && url.trim()) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        粘贴职位链接
        <span className="text-gray-400 font-normal ml-1">(自动填充表单)</span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            disabled={disabled || isParsing}
            placeholder="https://www.shixiseng.com/... 或 https://www.zhipin.com/..."
            className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              error
                ? 'border-red-300 focus:ring-red-200'
                : success
                ? 'border-green-300 focus:ring-green-200'
                : 'border-gray-300'
            }`}
          />
          {isParsing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            </div>
          )}
          {success && !isParsing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleParse}
          disabled={!url.trim() || isParsing || disabled}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[80px] justify-center"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>解析中</span>
            </>
          ) : (
            <span>解析</span>
          )}
        </button>
      </div>

      {/* Platform detection hint */}
      {detectedPlatform && !error && !success && (
        <p className="text-xs text-primary-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          检测到 {detectedPlatform} 链接
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          职位信息已自动填充，请检查并补充
        </p>
      )}

      {/* Supported platforms hint */}
      <p className="text-xs text-gray-400">
        支持平台: 实习僧, BOSS直聘
      </p>
    </div>
  );
};
