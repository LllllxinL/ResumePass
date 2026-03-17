import { useState } from 'react';
import { ChevronDown, ChevronUp, Mic, Clock } from 'lucide-react';

interface TranscriptionViewProps {
  transcription: string;
}

export const TranscriptionView = ({ transcription }: TranscriptionViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const estimatedDuration = Math.ceil(transcription.length / 10); // Rough estimate

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">完整转录文本</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              约 {Math.ceil(estimatedDuration / 60)} 分钟音频
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {transcription.length} 字
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="max-h-60 overflow-y-auto bg-white p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
};
