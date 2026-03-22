import type { JobType, Channel } from '../types';
import { parseJDWithCoze } from '../services/cozeApi';

export interface ParsedJobData {
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  city?: string;
  salaryRange?: string;
  channel: Channel;
  jobUrl?: string;
  jobDescription?: string;
  tags: string[];
}

/**
 * 推断投递渠道
 */
const detectChannel = (text: string): Channel => {
  if (text.includes('实习僧') || text.includes('shixiseng')) return '实习僧';
  if (text.includes('BOSS') || text.includes('直聘') || text.includes('zhipin')) return 'BOSS直聘';
  if (text.includes('牛客') || text.includes('nowcoder')) return '牛客';
  if (text.includes('智联')) return '智联招聘';
  if (text.includes('前程无忧') || text.includes('51job')) return '前程无忧';
  if (text.includes('内推') || text.includes('推荐') || text.includes('refer')) return '内推';
  if (text.includes('官网') || text.includes('官方')) return '官网';
  return '其他';
};

/**
 * 清理岗位描述文本
 */
const cleanJobDescription = (text: string): string => {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

/**
 * 使用 Coze AI 分析JD文本，提取职位信息
 */
export const parseJobDescription = async (text: string): Promise<ParsedJobData> => {
  if (!text || text.trim().length < 10) {
    throw new Error('请输入有效的岗位描述内容');
  }

  const aiResult = await parseJDWithCoze(text);

  const channel = detectChannel(text);
  const jobDescription = cleanJobDescription(text);

  return {
    companyName: aiResult.companyName || '',
    jobTitle: aiResult.jobTitle || '',
    jobType: (aiResult.jobType as JobType) || '其他',
    city: aiResult.city || '',
    salaryRange: aiResult.salaryRange || '',
    channel,
    jobDescription,
    tags: aiResult.tags?.length > 0 ? aiResult.tags : [],
  };
};

/**
 * 检查文本是否包含JD内容
 */
export const isValidJobDescription = (text: string): boolean => {
  if (!text || text.trim().length < 20) return false;

  const jdKeywords = [
    '职位', '岗位', '职责', '要求', '任职要求', '岗位职责',
    '工作', '实习', '招聘', '薪资', '待遇', '福利',
    '学历', '经验', '专业', '技能', '优先'
  ];

  const textLower = text.toLowerCase();
  const matchCount = jdKeywords.filter(kw => textLower.includes(kw.toLowerCase())).length;

  return matchCount >= 2;
};
