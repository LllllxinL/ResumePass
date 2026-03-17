import type { JobType, Channel } from '../types';

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

// 知名公司库
const KNOWN_COMPANIES = [
  '字节跳动', '字节', '抖音', 'TikTok', '今日头条',
  '腾讯', '微信', 'QQ', '王者荣耀',
  '阿里巴巴', '阿里', '淘宝', '天猫', '钉钉',
  '美团', '大众点评',
  '京东', '拼多多', '快手', '小红书', '哔哩哔哩', 'B站',
  '百度', '网易', '网易云音乐', '有道',
  '小米', '华为', 'OPPO', 'vivo', '荣耀',
  '滴滴', '携程', '饿了么', '菜鸟网络',
  '蚂蚁集团', '蚂蚁金服', '支付宝',
  '蔚来', '理想', '小鹏', '特斯拉',
  '滴滴出行', '贝壳', '知乎', '得到', '猿辅导'
];

// 城市列表
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '苏州', '天津', '重庆', '长沙', '郑州', '合肥', '厦门', '青岛', '大连', '宁波', '无锡'];

// 技术关键词映射
const TECH_KEYWORDS: Record<string, string[]> = {
  '技术': ['开发', '工程师', '算法', '前端', '后端', '客户端', 'iOS', 'Android', 'Java', 'Python', 'Go', 'C++', '测试', '运维', '架构'],
  '产品': ['产品经理', '产品策划', '产品助理', '产品专员', '产品运营'],
  '设计': ['设计', 'UI', 'UX', '交互', '视觉', '平面', '插画', '3D'],
  '运营': ['运营', '策划', '推广', '内容', '社群', '用户', '活动'],
  '市场': ['市场', '营销', '品牌', '商务', 'BD', '渠道', '公关'],
  '销售': ['销售', '客户', '渠道', 'BD', '大客户'],
  '职能': ['HR', '人事', '行政', '财务', '法务', '招聘', '助理']
};

// 技术栈标签
const TECH_TAGS = ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Java', 'Python', 'Go', 'C++', 'iOS', 'Android', 'Flutter', 'Swift', 'Kotlin', 'Rust', 'PHP', 'Ruby', 'AI', '机器学习', '深度学习', '大数据', '云计算', 'Docker', 'Kubernetes', 'MySQL', 'Redis', 'MongoDB', 'Elasticsearch', 'Kafka'];

// 业务标签
const BUSINESS_TAGS = ['电商', '社交', '金融', '教育', '医疗', '游戏', '企业服务', 'SaaS', 'O2O', '内容', '视频', '直播', '广告', '支付'];

// 公司标签
const COMPANY_TAGS = ['大厂', '独角兽', '外企', '国企', '创业公司', '互联网', '上市公司', '500强'];

/**
 * 转义正则表达式中的特殊字符
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 从JD文本中提取公司名称
 */
const extractCompanyName = (text: string): string => {
  // 首先查找知名公司
  for (const company of KNOWN_COMPANIES) {
    if (text.includes(company)) {
      // 返回完整的公司名
      if (company === '字节') return '字节跳动';
      if (company === '阿里') return '阿里巴巴';
      if (company === 'B站') return '哔哩哔哩';
      return company;
    }
  }

  // 匹配"XX公司"、"XX科技"等模式 - 扩展更多模式
  const patterns = [
    /(?:公司名称|公司名|企业名称)[:：]?\s*["']?([\u4e00-\u9fa5a-zA-Z]{2,20})["']?/i,
    /(?:关于|简介|公司)[:：]?\s*["']?([\u4e00-\u9fa5]{2,8})(?:公司|科技|集团|网络|信息)?["']?/,
    /(?:公司|企业)[】\]]([\u4e00-\u9fa5]{2,8})[【\[]/,
    /(?:我们|我司|本公司)是["']?([\u4e00-\u9fa5]{2,10})(?:公司|科技|集团|网络)?["']?/,
    // 匹配行首可能的公司名（很多JD第一行是公司名）
    /^\s*["']?([\u4e00-\u9fa5]{2,10})(?:公司|科技|集团|网络|信息|智能|软件|传媒|文化|教育)["']?/m,
    // 匹配【公司名】模式
    /[【\[]([\u4e00-\u9fa5]{2,10})(?:公司|科技|集团|网络)?[】\]]/,
    // 匹配括号里的公司名
    /\(([\u4e00-\u9fa5]{2,10})(?:公司|科技|集团|网络)?\)/,
    // 更广泛的公司模式匹配
    /([\u4e00-\u9fa5]{2,})(?:有限公司|有限责任公司|股份公司|科技|集团|网络|信息|智能|软件|传媒|文化|教育|工作室|中心|研究院|学院)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length >= 2 && name.length <= 20) {
        return name;
      }
    }
  }

  return '';
};

/**
 * 从JD文本中提取岗位名称
 */
const extractJobTitle = (text: string): string => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. 首先尝试从【】或[]中直接提取（常见于标题格式）
  const bracketPatterns = [
    /[【\[]([^【\[\]】]{2,20}(?:实习生|工程师|经理|专员|助理|主管|总监|顾问|师|员))[】\]]/,
    /[【\[]([^【\[\]】]{2,20})[】\]]/,
  ];
  for (const pattern of bracketPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length >= 2 && title.length <= 25) {
        return title;
      }
    }
  }

  // 2. 标准职位/岗位标记匹配
  const standardPatterns = [
    /(?:职位|岗位|职位名称|岗位名称|Job Title|title)[:：]\s*["']?([^\n"']{2,25})["']?/i,
    /(?:招聘|诚聘|急聘)[:：]?\s*["']?([^\n"']{2,25}(?:实习生|工程师|经理|专员|助理|主管|总监|顾问|师|员))["']?/,
    /^(?:【.*?】)?\s*([^\n]{2,25}(?:实习生|工程师|经理|专员|助理|主管|总监|顾问|师|员))$/m,
  ];
  for (const pattern of standardPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length >= 2 && title.length <= 25) {
        return title.replace(/[【\[\(].*?[\]\)】]/g, '').trim();
      }
    }
  }

  // 3. 从第一行提取（很多JD标题就是岗位名）
  if (lines.length > 0) {
    const firstLine = lines[0];
    // 如果第一行包含常见岗位词，直接使用
    const jobKeywords = ['实习生', '工程师', '经理', '专员', '助理', '主管', '总监', '顾问', '设计师', '分析师', '开发', '测试', '运维', '产品', '运营', '销售', '市场', '人事', '财务', '行政', '管培生'];
    for (const keyword of jobKeywords) {
      if (firstLine.includes(keyword)) {
        // 提取包含关键词的短语
        const match = firstLine.match(new RegExp(`([^【\[\]】]{0,15}${keyword}[^【\[\]】]{0,10})`));
        if (match && match[1] && match[1].length >= 2 && match[1].length <= 25) {
          return match[1].trim();
        }
      }
    }
    // 如果第一行不长，可能它就是标题
    if (firstLine.length >= 4 && firstLine.length <= 20 && !firstLine.includes('公司') && !firstLine.includes('简介')) {
      return firstLine.replace(/[【\[\(].*?[\]\)】]/g, '').trim();
    }
  }

  // 4. 从文本中匹配更广泛的岗位模式
  const jobPatterns = [
    // 技术类
    /([\u4e00-\u9fa5]*(?:前端|后端|Java|Python|Go|iOS|Android|算法|测试|运维|数据).*?(?:开发|工程师|实习生|工程))/i,
    // 产品类
    /([\u4e00-\u9fa5]*(?:产品|项目).*?(?:经理|助理|实习生|专员|主管))/i,
    // 设计类
    /([\u4e00-\u9fa5]*(?:UI|UX|视觉|交互|平面|UIUX).*?(?:设计|设计师|实习生))/i,
    // 运营/市场类
    /([\u4e00-\u9fa5]*(?:运营|市场|销售|商务|推广|品牌|内容|社群|活动|用户).*?(?:专员|助理|实习生|经理|主管))/i,
    // 职能类
    /([\u4e00-\u9fa5]*(?:HR|人事|人力|财务|行政|法务|招聘|培训).*?(?:专员|助理|实习生|经理|主管))/i,
    // 通用实习生模式
    /([\u4e00-\u9fa5]{2,10}实习生)/,
    // 通用岗位模式（XX专员/助理/经理等）
    /([\u4e00-\u9fa5]{2,12}(?:专员|助理|经理|主管|总监|顾问|师))/,
    // 更通用的匹配（前5行中找包含岗位词的短语）
  ];

  for (const pattern of jobPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length >= 2 && title.length <= 25) {
        return title;
      }
    }
  }

  // 5. 最后尝试：在前几行中找任何包含岗位关键词的短语
  for (const line of lines.slice(0, 3)) {
    const cleanLine = line.replace(/[【\[\(].*?[\]\)】]/g, '').trim();
    for (const keyword of ['实习生', '工程师', '经理', '专员', '助理']) {
      const idx = cleanLine.indexOf(keyword);
      if (idx !== -1) {
        // 提取关键词前后的一些文字
        const start = Math.max(0, idx - 10);
        const end = Math.min(cleanLine.length, idx + keyword.length + 5);
        const potential = cleanLine.substring(start, end).trim();
        if (potential.length >= 2 && potential.length <= 25) {
          return potential;
        }
      }
    }
  }

  return '';
};

/**
 * 根据关键词推断岗位类型
 */
const detectJobType = (text: string): JobType => {
  const textLower = text.toLowerCase();

  // 统计各类型关键词出现次数
  const scores: Record<string, number> = {};

  for (const [type, keywords] of Object.entries(TECH_KEYWORDS)) {
    scores[type] = 0;
    for (const keyword of keywords) {
      const escapedKeyword = escapeRegExp(keyword);
      const regex = new RegExp(escapedKeyword, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        scores[type] += matches.length;
      }
    }
  }

  // 找到得分最高的类型
  let maxType: JobType = '其他';
  let maxScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type as JobType;
    }
  }

  // 如果没有匹配到，根据关键词判断
  if (maxScore === 0) {
    if (/开发|程序|代码|技术|工程/.test(text)) return '技术';
    if (/产品|需求|PRD|原型|用户调研/.test(text)) return '产品';
    if (/设计|视觉|UI|UX|界面|创意/.test(text)) return '设计';
    if (/运营|内容|用户增长|社群|活动/.test(text)) return '运营';
    if (/市场|品牌|推广|营销|公关/.test(text)) return '市场';
    if (/销售|客户|渠道|BD|商务/.test(text)) return '销售';
    if (/HR|人事|行政|财务|法务|招聘/.test(text)) return '职能';
  }

  return maxType;
};

/**
 * 从JD文本中提取城市
 */
const extractCity = (text: string): string => {
  // 首先查找城市列表
  for (const city of CITIES) {
    if (text.includes(city)) {
      return city;
    }
  }

  // 匹配"工作地点"、"城市"等模式
  const patterns = [
    /(?:工作地点|工作城市|城市|base)[:：]?\s*([\u4e00-\u9fa5]{2,4})/,
    /(?:地点|位置)[:：]?\s*([\u4e00-\u9fa5]{2,4})/,
    /([\u4e00-\u9fa5]{2,4})办公/,
    /([\u4e00-\u9fa5]{2,4})市/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const city = match[1].replace(/市$/, '');
      if (city.length >= 2 && city.length <= 4) {
        return city;
      }
    }
  }

  return '';
};

/**
 * 从JD文本中提取薪资范围
 */
const extractSalaryRange = (text: string): string => {
  // 匹配各种薪资模式
  const patterns = [
    // 日薪：200-300/天，150~250/天
    /(\d{2,4})[-~](\d{2,4}).{0,5}(?:\/|\s)?(?:天|日)/,
    // 月薪：10k-15k，10-15K，10000-15000
    /(\d{1,2})(?:k|K)[-\s]?(\d{1,2})(?:k|K)/,
    /(\d{4,5})[-~](\d{4,5})/,
    // 年薪：15-20万，15w-20w
    /(\d{1,2})[-~](\d{1,2})(?:万|w|W)/,
    // 薪资：XXX元/天
    /(\d{3,4})(?:\s*)元\s*\/\s*(?:天|日)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let min = match[1];
      let max = match[2];

      // 转换K为具体数字
      if (pattern.source.includes('k|K')) {
        min = (parseInt(min) * 1000).toString();
        max = (parseInt(max) * 1000).toString();
      }

      // 转换万年薪为月薪
      if (pattern.source.includes('万|w|W')) {
        min = (parseInt(min) * 10000 / 12).toString();
        max = (parseInt(max) * 10000 / 12).toString();
      }

      // 判断是日薪还是月薪
      if (pattern.source.includes('天|日') || (parseInt(min) < 1000 && parseInt(max) < 1000)) {
        return `${min}-${max}/天`;
      } else {
        return `${min}-${max}/月`;
      }
    }
  }

  return '';
};

/**
 * 从JD文本中提取标签
 */
const extractTags = (text: string): string[] => {
  const tags: string[] = [];
  const textLower = text.toLowerCase();

  // 提取技术标签
  for (const tag of TECH_TAGS) {
    // 使用转义后的标签进行匹配，避免特殊字符问题
    const escapedTag = escapeRegExp(tag);
    const regex = new RegExp(escapedTag, 'gi');
    if (regex.test(textLower)) {
      tags.push(tag);
    }
  }

  // 提取业务标签
  for (const tag of BUSINESS_TAGS) {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  }

  // 提取公司标签
  for (const tag of COMPANY_TAGS) {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  }

  // 如果标签太少，添加岗位类型作为标签
  if (tags.length < 3) {
    const jobType = detectJobType(text);
    if (jobType !== '其他' && !tags.includes(jobType)) {
      tags.push(jobType);
    }
  }

  // 去重并限制数量
  return [...new Set(tags)].slice(0, 6);
};

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
  // 移除多余的空行
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

/**
 * Mock AI分析JD文本
 * 基于规则和关键词匹配提取职位信息
 */
export const parseJobDescription = async (text: string): Promise<ParsedJobData> => {
  // 模拟网络延迟 1-2秒
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  if (!text || text.trim().length < 10) {
    throw new Error('请输入有效的岗位描述内容');
  }

  const companyName = extractCompanyName(text);
  const jobTitle = extractJobTitle(text);
  const jobType = detectJobType(text);
  const city = extractCity(text);
  const salaryRange = extractSalaryRange(text);
  const tags = extractTags(text);
  const channel = detectChannel(text);
  const jobDescription = cleanJobDescription(text);

  // 如果没有提取到公司名或岗位名，给出警告
  if (!companyName && !jobTitle) {
    throw new Error('无法从文本中提取关键信息，请检查输入或手动填写');
  }

  return {
    companyName: companyName || '未知公司',
    jobTitle: jobTitle || '未知岗位',
    jobType,
    city,
    salaryRange,
    channel,
    jobDescription,
    tags: tags.length > 0 ? tags : ['实习'],
  };
};

/**
 * 检查文本是否包含JD内容
 */
export const isValidJobDescription = (text: string): boolean => {
  if (!text || text.trim().length < 20) return false;

  // 检查是否包含JD常见关键词
  const jdKeywords = [
    '职位', '岗位', '职责', '要求', '任职要求', '岗位职责',
    '工作', '实习', '招聘', '薪资', '待遇', '福利',
    '学历', '经验', '专业', '技能', '优先'
  ];

  const textLower = text.toLowerCase();
  const matchCount = jdKeywords.filter(kw => textLower.includes(kw.toLowerCase())).length;

  return matchCount >= 2;
};
