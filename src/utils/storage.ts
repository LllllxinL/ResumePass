import type { Application, Interview } from '../types';

// Storage Keys (基础 key，需要拼接 userId)
const BASE_KEYS = {
  APPLICATIONS: 'interntrack_applications',
  INTERVIEWS: 'interntrack_interviews',
  AUTH: 'interntrack_auth',
  USERS: 'interntrack_users',
};

// 获取当前用户 ID
const getCurrentUserId = (): string | null => {
  const auth = localStorage.getItem(BASE_KEYS.AUTH);
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.user?.id || null;
    } catch {
      return null;
    }
  }
  return null;
};

// 获取当前用户的 storage key
const getUserStorageKey = (baseKey: string): string => {
  const userId = getCurrentUserId();
  if (!userId) return baseKey;
  return `${baseKey}_${userId}`;
};

// 投递记录存储
export const applicationStorage = {
  getAll: (): Application[] => {
    const key = getUserStorageKey(BASE_KEYS.APPLICATIONS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Application | undefined => {
    const apps = applicationStorage.getAll();
    return apps.find((a) => a.id === id);
  },

  create: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application => {
    const apps = applicationStorage.getAll();
    const newApp: Application = {
      ...application,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const key = getUserStorageKey(BASE_KEYS.APPLICATIONS);
    localStorage.setItem(key, JSON.stringify([...apps, newApp]));
    return newApp;
  },

  update: (id: string, updates: Partial<Application>): Application | null => {
    const apps = applicationStorage.getAll();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return null;

    apps[index] = {
      ...apps[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const key = getUserStorageKey(BASE_KEYS.APPLICATIONS);
    localStorage.setItem(key, JSON.stringify(apps));
    return apps[index];
  },

  delete: (id: string): boolean => {
    const apps = applicationStorage.getAll();
    const filtered = apps.filter((a) => a.id !== id);
    if (filtered.length === apps.length) return false;
    const key = getUserStorageKey(BASE_KEYS.APPLICATIONS);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  // 生成示例数据（为当前用户）
  generateDemoData: (): void => {
    const demoApps: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        companyName: '字节跳动',
        jobTitle: '前端开发实习生',
        jobType: '技术',
        city: '北京',
        salaryRange: '400-500/天',
        channel: 'BOSS直聘',
        applyDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'interview',
        priority: 'high',
        tags: ['大厂', '心仪'],
        jobDescription: '负责抖音前端开发',
        notes: '已经一面完成，等待二面',
      },
      {
        companyName: '阿里巴巴',
        jobTitle: '产品运营实习生',
        jobType: '运营',
        city: '杭州',
        salaryRange: '150-200/天',
        channel: '官网',
        applyDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'screening',
        priority: 'medium',
        tags: ['大厂'],
        jobDescription: '负责淘宝用户增长',
        notes: '',
      },
      {
        companyName: '小红书',
        jobTitle: 'UI设计实习生',
        jobType: '设计',
        city: '上海',
        salaryRange: '200-250/天',
        channel: '实习僧',
        applyDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'applied',
        priority: 'high',
        tags: ['心仪'],
        jobDescription: '负责社区界面设计',
        notes: '',
      },
      {
        companyName: '美团',
        jobTitle: '后端开发实习生',
        jobType: '技术',
        city: '北京',
        salaryRange: '300-400/天',
        channel: '内推',
        applyDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'rejected',
        priority: 'medium',
        tags: [],
        jobDescription: '负责外卖系统开发',
        notes: '简历筛选未通过',
      },
      {
        companyName: '腾讯',
        jobTitle: '产品经理实习生',
        jobType: '产品',
        city: '深圳',
        salaryRange: '200-300/天',
        channel: '牛客',
        applyDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'offer',
        priority: 'high',
        tags: ['大厂', '心仪'],
        jobDescription: '负责微信功能迭代',
        notes: '已通过三面，收到口头offer',
      },
    ];

    const existing = applicationStorage.getAll();
    if (existing.length === 0) {
      demoApps.forEach((app) => applicationStorage.create(app));
    }
  },

  clear: (): void => {
    const key = getUserStorageKey(BASE_KEYS.APPLICATIONS);
    localStorage.removeItem(key);
  },
};

// 面试记录存储
export const interviewStorage = {
  getAll: (): Interview[] => {
    const key = getUserStorageKey(BASE_KEYS.INTERVIEWS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getByApplicationId: (applicationId: string): Interview[] => {
    const interviews = interviewStorage.getAll();
    return interviews.filter((i) => i.applicationId === applicationId);
  },

  getById: (id: string): Interview | undefined => {
    const interviews = interviewStorage.getAll();
    return interviews.find((i) => i.id === id);
  },

  create: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Interview => {
    const interviews = interviewStorage.getAll();
    const newInterview: Interview = {
      ...interview,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const key = getUserStorageKey(BASE_KEYS.INTERVIEWS);
    localStorage.setItem(key, JSON.stringify([...interviews, newInterview]));
    return newInterview;
  },

  update: (id: string, updates: Partial<Interview>): Interview | null => {
    const interviews = interviewStorage.getAll();
    const index = interviews.findIndex((i) => i.id === id);
    if (index === -1) return null;

    interviews[index] = {
      ...interviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const key = getUserStorageKey(BASE_KEYS.INTERVIEWS);
    localStorage.setItem(key, JSON.stringify(interviews));
    return interviews[index];
  },

  delete: (id: string): boolean => {
    const interviews = interviewStorage.getAll();
    const filtered = interviews.filter((i) => i.id !== id);
    if (filtered.length === interviews.length) return false;
    const key = getUserStorageKey(BASE_KEYS.INTERVIEWS);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  clear: (): void => {
    const key = getUserStorageKey(BASE_KEYS.INTERVIEWS);
    localStorage.removeItem(key);
  },
};

// 数据统计
export const getStatistics = () => {
  const apps = applicationStorage.getAll();

  const total = apps.length;
  const byStatus = apps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byChannel = apps.reduce((acc, app) => {
    acc[app.channel] = (acc[app.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byJobType = apps.reduce((acc, app) => {
    acc[app.jobType] = (acc[app.jobType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 本周投递数
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = apps.filter((app) => new Date(app.applyDate) >= weekAgo).length;

  // 转化率
  const interviewCount = apps.filter((app) =>
    ['interview', 'offer', 'accepted'].includes(app.status)
  ).length;
  const offerCount = apps.filter((app) => ['offer', 'accepted'].includes(app.status)).length;

  const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;

  // 平均回复周期（估算，基于投递日期和状态变化）
  const respondedApps = apps.filter((app) =>
    ['rejected', 'interview', 'offer', 'accepted'].includes(app.status)
  );

  return {
    total,
    byStatus,
    byChannel,
    byJobType,
    thisWeekCount,
    interviewRate,
    offerRate,
    interviewCount,
    offerCount,
    respondedCount: respondedApps.length,
  };
};

// 导出基础 key 供 auth 使用
export { BASE_KEYS };
