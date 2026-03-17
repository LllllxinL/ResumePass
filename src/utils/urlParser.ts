import type { JobType, Channel } from '../types';

export interface ParsedJobData {
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  city?: string;
  salaryRange?: string;
  channel: Channel;
  jobUrl: string;
  jobDescription?: string;
  tags: string[];
}

type Platform = 'shixiseng' | 'zhipin' | 'unknown';

/**
 * Detect platform type from URL
 */
export const detectPlatform = (url: string): Platform => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('shixiseng.com')) return 'shixiseng';
    if (hostname.includes('zhipin.com')) return 'zhipin';
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Validate if URL is a valid job posting URL
 */
export const isValidJobUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Mock data templates for 实习僧
const SHIXISENG_MOCK_TEMPLATES: Omit<ParsedJobData, 'channel' | 'jobUrl'>[] = [
  {
    companyName: '字节跳动',
    jobTitle: '前端开发实习生',
    jobType: '技术',
    city: '北京',
    salaryRange: '400-500/天',
    jobDescription: '1. 负责抖音、今日头条等产品的前端开发工作\n2. 使用React技术栈，参与组件库建设\n3. 与产品、设计、后端紧密配合，完成需求交付\n\n要求：\n- 熟悉HTML/CSS/JavaScript\n- 了解React/Vue等前端框架\n- 每周至少实习4天，实习3个月以上',
    tags: ['大厂', '前端', 'React', '抖音'],
  },
  {
    companyName: '腾讯',
    jobTitle: '后端开发实习生',
    jobType: '技术',
    city: '深圳',
    salaryRange: '300-400/天',
    jobDescription: '1. 参与腾讯云后台服务开发\n2. 使用Go/Python进行服务端开发\n3. 参与分布式系统设计与实现\n\n要求：\n- 熟悉至少一门编程语言(Go/Python/Java)\n- 了解数据库、缓存、消息队列\n- 计算机相关专业优先',
    tags: ['大厂', '后端', '腾讯', '云服务'],
  },
  {
    companyName: '美团',
    jobTitle: '产品经理实习生',
    jobType: '产品',
    city: '北京',
    salaryRange: '250-350/天',
    jobDescription: '1. 参与美团外卖产品功能策划\n2. 收集用户反馈，进行需求分析\n3. 撰写PRD文档，跟进功能上线\n\n要求：\n- 对产品有热情，逻辑清晰\n- 良好的沟通协调能力\n- 有相关实习经验优先',
    tags: ['大厂', '产品', '美团', '外卖'],
  },
  {
    companyName: '小红书',
    jobTitle: '运营实习生',
    jobType: '运营',
    city: '上海',
    salaryRange: '150-200/天',
    jobDescription: '1. 参与社区内容运营\n2. 协助策划话题活动\n3. 数据分析与报告撰写\n\n要求：\n- 小红书重度用户，熟悉社区氛围\n- 文案能力强，有创意\n- 本科及以上学历',
    tags: ['互联网', '运营', '小红书', '社区'],
  },
  {
    companyName: '阿里巴巴',
    jobTitle: '算法实习生',
    jobType: '技术',
    city: '杭州',
    salaryRange: '400-600/天',
    jobDescription: '1. 参与推荐算法优化\n2. 使用机器学习技术解决业务问题\n3. 参与A/B测试与效果评估\n\n要求：\n- 熟悉Python，了解TensorFlow/PyTorch\n- 有机器学习项目经验\n- 计算机/数学/统计相关专业',
    tags: ['大厂', '算法', '阿里', '推荐'],
  },
];

// Mock data templates for BOSS直聘
const ZHIPIN_MOCK_TEMPLATES: Omit<ParsedJobData, 'channel' | 'jobUrl'>[] = [
  {
    companyName: '字节跳动',
    jobTitle: 'iOS开发实习生',
    jobType: '技术',
    city: '北京',
    salaryRange: '400-500/天',
    jobDescription: '负责抖音iOS客户端开发\n\n岗位职责:\n1. 参与抖音核心功能开发\n2. 优化App性能与用户体验\n3. 参与技术方案设计\n\n任职要求:\n1. 熟悉Objective-C/Swift\n2. 了解iOS开发框架\n3. 有实际项目经验优先',
    tags: ['大厂', 'iOS', '客户端', '抖音'],
  },
  {
    companyName: '京东',
    jobTitle: 'Java开发实习生',
    jobType: '技术',
    city: '北京',
    salaryRange: '300-400/天',
    jobDescription: '参与京东电商平台开发\n\n岗位职责:\n1. 参与后端服务设计与开发\n2. 负责系统性能优化\n3. 参与技术难题攻关\n\n任职要求:\n1. 熟悉Java编程\n2. 了解Spring框架\n3. 熟悉MySQL/Redis',
    tags: ['大厂', 'Java', '后端', '电商'],
  },
  {
    companyName: '网易',
    jobTitle: 'UI设计师实习生',
    jobType: '设计',
    city: '广州',
    salaryRange: '150-250/天',
    jobDescription: '参与网易云音乐产品设计\n\n岗位职责:\n1. 参与产品界面设计\n2. 制作设计规范与组件\n3. 跟进开发落地\n\n任职要求:\n1. 熟练使用Figma/Sketch\n2. 有优秀的审美能力\n3. 美术/设计相关专业',
    tags: ['大厂', '设计', '网易', '音乐'],
  },
  {
    companyName: '拼多多',
    jobTitle: '数据分析实习生',
    jobType: '技术',
    city: '上海',
    salaryRange: '300-400/天',
    jobDescription: '参与业务数据分析工作\n\n岗位职责:\n1. 参与业务数据报表开发\n2. 进行数据挖掘与分析\n3. 为业务决策提供数据支持\n\n任职要求:\n1. 熟练使用SQL\n2. 熟悉Python数据分析工具\n3. 数学/统计/计算机相关专业',
    tags: ['大厂', '数据分析', '拼多多', '电商'],
  },
  {
    companyName: '小米',
    jobTitle: '硬件测试实习生',
    jobType: '技术',
    city: '北京',
    salaryRange: '200-300/天',
    jobDescription: '参与手机硬件测试\n\n岗位职责:\n1. 执行硬件测试用例\n2. 记录并跟踪问题\n3. 编写测试报告\n\n任职要求:\n1. 电子/通信相关专业\n2. 对手机硬件有兴趣\n3. 细心负责',
    tags: ['大厂', '测试', '小米', '硬件'],
  },
];

/**
 * Generate deterministic mock data based on URL
 * Same URL will always return same mock data
 */
const generateMockData = (
  platform: Platform,
  url: string
): ParsedJobData => {
  const templates =
    platform === 'shixiseng' ? SHIXISENG_MOCK_TEMPLATES : ZHIPIN_MOCK_TEMPLATES;

  // Use URL hash to deterministically select a template
  const hash = url.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const template = templates[hash % templates.length];

  return {
    ...template,
    channel: platform === 'shixiseng' ? '实习僧' : 'BOSS直聘',
    jobUrl: url,
  };
};

/**
 * Mock job URL parser
 * Simulates parsing a job posting URL and extracting job information
 */
export const parseJobUrl = async (url: string): Promise<ParsedJobData> => {
  // Simulate network delay (1-2 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  // Validate URL format
  if (!isValidJobUrl(url)) {
    throw new Error('请输入有效的URL链接');
  }

  const platform = detectPlatform(url);

  if (platform === 'unknown') {
    throw new Error('暂不支持该平台，请手动填写表单');
  }

  // Simulate occasional parsing failure (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('解析失败，请检查链接是否有效或稍后重试');
  }

  return generateMockData(platform, url);
};

/**
 * Get supported platforms list
 */
export const getSupportedPlatforms = (): string[] => {
  return ['实习僧 (shixiseng.com)', 'BOSS直聘 (zhipin.com)'];
};
