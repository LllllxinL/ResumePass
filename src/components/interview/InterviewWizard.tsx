import { useState } from 'react';
import { Mic, ArrowRight, Check, X, Loader2, Sparkles, Edit3 } from 'lucide-react';
import type { Interview } from '../../types';
import { AudioUploader } from './AudioUploader';
import { AIQuestionExtractor } from './AIQuestionExtractor';
import { InterviewForm } from './InterviewForm';

type WizardStep = 'choose' | 'upload' | 'transcribing' | 'extract' | 'form';
type InterviewMethod = 'audio' | 'manual';

interface InterviewWizardProps {
  applicationId: string;
  initialData?: Interview;
  onSave: (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const InterviewWizard = ({ applicationId, initialData, onSave, onCancel }: InterviewWizardProps) => {
  const [step, setStep] = useState<WizardStep>(initialData ? 'form' : 'choose');
  const [method, setMethod] = useState<InterviewMethod | null>(null);

  // 转录相关状态
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [extractedQuestions, setExtractedQuestions] = useState<string[]>([]);

  // 面经表单数据
  const [formData, setFormData] = useState<Partial<Interview>>({
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
    transcription: initialData?.transcription || '',
  });

  const handleMethodSelect = (selectedMethod: InterviewMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'audio') {
      setStep('upload');
    } else {
      setStep('form');
    }
  };

  const handleAudioUpload = (file: File) => {
    setAudioFile(file);
    setStep('transcribing');

    // 模拟转录过程（MVP阶段）
    setTimeout(() => {
      const mockTranscription = generateMockTranscription();
      setTranscription(mockTranscription);

      // 模拟提取问题
      const mockQuestions = extractMockQuestions(mockTranscription);
      setExtractedQuestions(mockQuestions);

      setStep('extract');
    }, 3000);
  };

  const handleQuestionsSelected = (selectedQuestions: string[]) => {
    setFormData(prev => ({
      ...prev,
      questions: selectedQuestions.join('\n\n'),
      transcription,
    }));
    setStep('form');
  };

  const handleFormSubmit = (data: Partial<Interview>) => {
    onSave({
      ...data,
      applicationId,
    } as Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'choose':
        return (
          <StepChoose
            onSelect={handleMethodSelect}
            onCancel={onCancel}
          />
        );

      case 'upload':
        return (
          <AudioUploader
            onUpload={handleAudioUpload}
            onBack={() => setStep('choose')}
          />
        );

      case 'transcribing':
        return (
          <TranscribingView
            fileName={audioFile?.name || ''}
            onCancel={() => setStep('upload')}
          />
        );

      case 'extract':
        return (
          <AIQuestionExtractor
            transcription={transcription}
            extractedQuestions={extractedQuestions}
            onQuestionsSelected={handleQuestionsSelected}
            onBack={() => setStep('upload')}
            onSkip={() => setStep('form')}
          />
        );

      case 'form':
        return (
          <InterviewForm
            initialData={formData}
            onSubmit={handleFormSubmit}
            onCancel={onCancel}
            showBackButton={method === 'audio'}
            onBack={method === 'audio' ? () => setStep('extract') : undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 步骤指示器 */}
      {step !== 'form' && (
        <div className="flex items-center justify-center gap-2 py-4 border-b border-gray-100">
          <StepIndicator
            steps={[
              { key: 'choose', label: '选择方式' },
              { key: 'upload', label: '上传录音' },
              { key: 'transcribing', label: '转录中' },
              { key: 'extract', label: '提取问题' },
            ]}
            currentStep={step}
          />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderStepContent()}
      </div>
    </div>
  );
};

// 步骤1：选择方式
interface StepChooseProps {
  onSelect: (method: InterviewMethod) => void;
  onCancel: () => void;
}

const StepChoose = ({ onSelect, onCancel }: StepChooseProps) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">添加面经</h3>
      <p className="text-gray-500">选择一种方式记录你的面试经历</p>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {/* 上传录音选项 */}
      <button
        onClick={() => onSelect('audio')}
        className="flex items-start gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
          <Mic className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">上传录音转文字</h4>
          <p className="text-sm text-gray-500 mb-2">
            上传面试录音，系统自动转录并提取面试问题
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            AI 智能提取
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
      </button>

      {/* 直接记录选项 */}
      <button
        onClick={() => onSelect('manual')}
        className="flex items-start gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <Edit3 className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">直接记录面经</h4>
          <p className="text-sm text-gray-500">
            面试时已经做好笔记，直接填写问题和回答
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>

    <div className="flex justify-center pt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        取消
      </button>
    </div>
  </div>
);

// 转录中视图
interface TranscribingViewProps {
  fileName: string;
  onCancel: () => void;
}

const TranscribingView = ({ fileName, onCancel }: TranscribingViewProps) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-2">正在转录音频...</h3>
    <p className="text-sm text-gray-500 mb-1">{fileName}</p>
    <p className="text-xs text-gray-400 mb-6">预计需要 30-60 秒</p>

    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
      <div className="h-full bg-primary-500 rounded-full animate-[progress_3s_ease-in-out_infinite]"
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite'
        }}
      />
    </div>

    <button
      onClick={onCancel}
      className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
    >
      <X className="w-4 h-4" />
      取消转录
    </button>

    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

// 步骤指示器
interface StepIndicatorProps {
  steps: { key: string; label: string }[];
  currentStep: string;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              ${isActive ? 'bg-primary-100 text-primary-700' : ''}
              ${isCompleted ? 'bg-green-100 text-green-700' : ''}
              ${!isActive && !isCompleted ? 'text-gray-400' : ''}
            `}>
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current flex items-center justify-center text-white text-[10px]">
                  {index + 1}
                </span>
              )}
              <span className={isActive || isCompleted ? '' : 'hidden sm:inline'}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-8 h-0.5 mx-1
                ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// 模拟转录文本生成
const generateMockTranscription = (): string => {
  return `面试官：你好，请先做个自我介绍吧。

候选人：您好，我是XXX，目前在XXX大学读大三，专业是计算机科学。我之前有两段实习经历，一段是在XXX公司做前端开发，另一段是在XXX公司做全栈开发。我主要的技术栈是React、Vue和Node.js。

面试官：好的，我看到你简历上写了一个电商项目，能详细介绍一下吗？

候选人：好的。这个项目是一个基于React的电商平台，我负责前端部分的开发。主要功能包括商品展示、购物车、订单管理等。我们使用了Redux进行状态管理，用React Router做路由管理。

面试官：项目中遇到过什么技术难题吗？

候选人：有的。最大的挑战是商品列表的性能优化。当时商品列表有上千个SKU，滚动时很卡。我使用了虚拟滚动和懒加载来解决这个问题，最终首屏加载时间减少了60%。

面试官：你对加班怎么看？

候选人：我觉得在项目紧急的时候加班是必要的。但我更看重工作效率，平时会尽量在正常工作时间内完成任务。

面试官：你有什么问题要问我吗？

候选人：我想了解一下团队的规模和技术栈？

面试官：我们团队有15个人，主要用React和TypeScript。还有什么想问的吗？

候选人：没有了，谢谢您。

面试官：好的，今天的面试就到这里，结果会在一周内通知你。`;
};

// 模拟提取问题
const extractMockQuestions = (_transcription: string): string[] => {
  return [
    '请先做个自我介绍',
    '能详细介绍一下你的电商项目吗？',
    '项目中遇到过什么技术难题吗？',
    '你对加班怎么看？',
    '你有什么问题要问我吗？',
  ];
};
