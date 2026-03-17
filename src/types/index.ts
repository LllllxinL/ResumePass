// 投递进度状态
export type ApplicationStatus =
  | 'applied'      // 已投递
  | 'screening'    // 简历筛选中
  | 'read'         // 已读未回
  | 'rejected'     // 已拒绝
  | 'interview'    // 约面/面试中
  | 'offer'        // 收到offer
  | 'accepted'     // 已接受offer
  | 'declined';    // 已拒绝offer

// 岗位类型
export type JobType =
  | '技术'
  | '产品'
  | '设计'
  | '运营'
  | '市场'
  | '销售'
  | '职能'
  | '其他';

// 投递渠道
export type Channel =
  | '官网'
  | 'BOSS直聘'
  | '实习僧'
  | '牛客'
  | '智联招聘'
  | '前程无忧'
  | '内推'
  | '其他';

// 优先级
export type Priority = 'high' | 'medium' | 'low';

// 投递记录
export interface Application {
  id: string;
  companyName: string;      // 公司名
  jobTitle: string;         // 岗位名称
  jobType: JobType;         // 岗位类型
  city?: string;            // 工作城市
  salaryRange?: string;     // 薪资范围
  channel: Channel;         // 投递渠道
  jobUrl?: string;          // 投递链接
  applyDate: string;        // 投递日期 (ISO格式)
  status: ApplicationStatus;// 当前进度
  priority: Priority;       // 优先级
  tags: string[];           // 标签
  jobDescription?: string;  // JD内容
  notes?: string;           // 备注
  createdAt: string;
  updatedAt: string;
}

// 面试记录
export interface Interview {
  id: string;
  applicationId: string;    // 关联的投递记录ID
  round: number;            // 面试轮次
  roundName: string;        // 轮次名称（一面、二面、HR面等）
  interviewType: 'video' | 'phone' | 'onsite';  // 面试形式
  interviewer?: string;     // 面试官
  interviewerTitle?: string;// 面试官职位
  scheduledDate: string;    // 面试日期
  duration?: number;        // 面试时长（分钟）
  audioUrl?: string;        // 录音文件URL
  transcription?: string;   // 转录文字
  notes?: string;           // 笔记
  questions?: string;       // 面试问题
  reflections?: string;     // 反思总结
  rating?: number;          // 自我评分 1-5
  createdAt: string;
  updatedAt: string;
}

// 状态配置
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// 状态配置映射
export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  applied: {
    label: '已投递',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  screening: {
    label: '简历筛选中',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  read: {
    label: '已读未回',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  rejected: {
    label: '已拒绝',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  interview: {
    label: '面试中',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  accepted: {
    label: '已接受',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
  },
  declined: {
    label: '已拒绝Offer',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

// 优先级配置
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: '高', color: 'text-red-600 bg-red-50' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: '低', color: 'text-green-600 bg-green-50' },
};

// 岗位类型选项
export const JOB_TYPES: JobType[] = ['技术', '产品', '设计', '运营', '市场', '销售', '职能', '其他'];

// 投递渠道选项
export const CHANNELS: Channel[] = ['官网', 'BOSS直聘', '实习僧', '牛客', '智联招聘', '前程无忧', '内推', '其他'];

// 状态流转顺序（用于看板排序）
export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'screening',
  'read',
  'interview',
  'offer',
  'accepted',
  'declined',
  'rejected',
];
