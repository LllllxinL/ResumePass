import { useState, useRef } from 'react';
import { Upload, FileAudio, ArrowLeft, X } from 'lucide-react';

interface AudioUploaderProps {
  onUpload: (file: File) => void;
  onBack: () => void;
}

const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
];

const MAX_SIZE_MB = 50;

export const AudioUploader = ({ onUpload, onBack }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '不支持的文件格式，请上传 MP3、M4A、WAV 或 WEBM 格式的音频';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `文件大小超过 ${MAX_SIZE_MB}MB 限制`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">上传面试录音</h3>
        <p className="text-gray-500 text-sm">支持 MP3、M4A、WAV、WEBM 格式，最大 50MB</p>
      </div>

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-primary-100' : 'bg-gray-200'}
            transition-colors
          `}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-600' : 'text-gray-500'}`} />
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1">
            点击或拖拽文件到此处上传
          </p>
          <p className="text-xs text-gray-500">
            支持格式：MP3、M4A、WAV、WEBM
          </p>

          {isDragging && (
            <div className="absolute inset-0 bg-primary-50/80 rounded-xl flex items-center justify-center">
              <p className="text-primary-700 font-medium">松开以上传文件</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileAudio className="w-6 h-6 text-primary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setError(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">文件验证通过</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className={`
            flex items-center gap-1.5 px-6 py-2 rounded-lg text-sm font-medium
            ${selectedFile
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          开始转录
        </button>
      </div>
    </div>
  );
};
