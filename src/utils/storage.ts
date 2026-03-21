import { supabase } from '../lib/supabase';
import type { Application, Interview } from '../types';

// ── 字段转换：数据库 snake_case ↔ TypeScript camelCase ──────────────

const rowToApplication = (row: any): Application => ({
  id: row.id,
  companyName: row.company_name,
  jobTitle: row.job_title,
  jobType: row.job_type,
  city: row.city,
  salaryRange: row.salary_range,
  channel: row.channel,
  jobUrl: row.job_url,
  applyDate: row.apply_date,
  status: row.status,
  priority: row.priority,
  tags: row.tags ?? [],
  jobDescription: row.job_description,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const applicationToRow = (app: Partial<Application>) => ({
  company_name: app.companyName,
  job_title: app.jobTitle,
  job_type: app.jobType,
  city: app.city ?? null,
  salary_range: app.salaryRange ?? null,
  channel: app.channel,
  job_url: app.jobUrl ?? null,
  apply_date: app.applyDate,
  status: app.status,
  priority: app.priority,
  tags: app.tags ?? [],
  job_description: app.jobDescription ?? null,
  notes: app.notes ?? null,
});

const rowToInterview = (row: any): Interview => ({
  id: row.id,
  applicationId: row.application_id,
  round: row.round,
  roundName: row.round_name,
  interviewType: row.interview_type,
  interviewer: row.interviewer,
  interviewerTitle: row.interviewer_title,
  scheduledDate: row.scheduled_date,
  duration: row.duration,
  audioUrl: row.audio_url,
  transcription: row.transcription,
  notes: row.notes,
  questions: row.questions,
  reflections: row.reflections,
  rating: row.rating,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');
  return user.id;
};

// ── 投递记录存储 ──────────────────────────────────────────────────────

export const applicationStorage = {
  getAll: async (): Promise<Application[]> => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToApplication);
  },

  getById: async (id: string): Promise<Application | undefined> => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return rowToApplication(data);
  },

  create: async (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('applications')
      .insert({ ...applicationToRow(application), user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return rowToApplication(data);
  },

  update: async (id: string, updates: Partial<Application>): Promise<Application | null> => {
    const row: any = applicationToRow(updates);
    row.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('applications')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return rowToApplication(data);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    return !error;
  },

  generateDemoData: async (): Promise<void> => {
    const userId = await getUserId();
    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if ((count ?? 0) > 0) return;

    const demoApps = [
      { companyName: '字节跳动', jobTitle: '前端开发实习生', jobType: '技术', city: '北京', salaryRange: '400-500/天', channel: 'BOSS直聘', applyDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], status: 'interview', priority: 'high', tags: ['大厂', '心仪'], jobDescription: '负责抖音前端开发', notes: '已经一面完成，等待二面' },
      { companyName: '阿里巴巴', jobTitle: '产品运营实习生', jobType: '运营', city: '杭州', salaryRange: '150-200/天', channel: '官网', applyDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], status: 'screening', priority: 'medium', tags: ['大厂'], jobDescription: '负责淘宝用户增长', notes: '' },
      { companyName: '小红书', jobTitle: 'UI设计实习生', jobType: '设计', city: '上海', salaryRange: '200-250/天', channel: '实习僧', applyDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], status: 'applied', priority: 'high', tags: ['心仪'], jobDescription: '负责社区界面设计', notes: '' },
      { companyName: '腾讯', jobTitle: '产品经理实习生', jobType: '产品', city: '深圳', salaryRange: '200-300/天', channel: '牛客', applyDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], status: 'offer', priority: 'high', tags: ['大厂', '心仪'], jobDescription: '负责微信功能迭代', notes: '已通过三面，收到口头offer' },
    ] as Omit<Application, 'id' | 'createdAt' | 'updatedAt'>[];

    for (const app of demoApps) {
      await applicationStorage.create(app);
    }
  },

  clear: async (): Promise<void> => {
    const userId = await getUserId();
    await supabase.from('applications').delete().eq('user_id', userId);
  },
};

// ── 面试记录存储 ──────────────────────────────────────────────────────

export const interviewStorage = {
  getAll: async (): Promise<Interview[]> => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToInterview);
  },

  getByApplicationId: async (applicationId: string): Promise<Interview[]> => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', applicationId)
      .order('round', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToInterview);
  },

  getById: async (id: string): Promise<Interview | undefined> => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return rowToInterview(data);
  },

  create: async (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        user_id: userId,
        application_id: interview.applicationId,
        round: interview.round,
        round_name: interview.roundName,
        interview_type: interview.interviewType,
        interviewer: interview.interviewer ?? null,
        interviewer_title: interview.interviewerTitle ?? null,
        scheduled_date: interview.scheduledDate,
        duration: interview.duration ?? null,
        audio_url: interview.audioUrl ?? null,
        transcription: interview.transcription ?? null,
        notes: interview.notes ?? null,
        questions: interview.questions ?? null,
        reflections: interview.reflections ?? null,
        rating: interview.rating ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToInterview(data);
  },

  update: async (id: string, updates: Partial<Interview>): Promise<Interview | null> => {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.roundName !== undefined) row.round_name = updates.roundName;
    if (updates.interviewType !== undefined) row.interview_type = updates.interviewType;
    if (updates.interviewer !== undefined) row.interviewer = updates.interviewer;
    if (updates.interviewerTitle !== undefined) row.interviewer_title = updates.interviewerTitle;
    if (updates.scheduledDate !== undefined) row.scheduled_date = updates.scheduledDate;
    if (updates.duration !== undefined) row.duration = updates.duration;
    if (updates.audioUrl !== undefined) row.audio_url = updates.audioUrl;
    if (updates.transcription !== undefined) row.transcription = updates.transcription;
    if (updates.notes !== undefined) row.notes = updates.notes;
    if (updates.questions !== undefined) row.questions = updates.questions;
    if (updates.reflections !== undefined) row.reflections = updates.reflections;
    if (updates.rating !== undefined) row.rating = updates.rating;

    const { data, error } = await supabase
      .from('interviews')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return rowToInterview(data);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('interviews').delete().eq('id', id);
    return !error;
  },

  clear: async (): Promise<void> => {
    const userId = await getUserId();
    await supabase.from('interviews').delete().eq('user_id', userId);
  },
};

// ── 数据统计 ──────────────────────────────────────────────────────────

export const getStatistics = async () => {
  const apps = await applicationStorage.getAll();
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

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const thisWeekCount = apps.filter(app => new Date(app.applyDate) >= weekAgo).length;
  const interviewCount = apps.filter(app => ['interview', 'offer', 'accepted'].includes(app.status)).length;
  const offerCount = apps.filter(app => ['offer', 'accepted'].includes(app.status)).length;

  return {
    total,
    byStatus,
    byChannel,
    byJobType,
    thisWeekCount,
    interviewRate: total > 0 ? Math.round((interviewCount / total) * 100) : 0,
    offerRate: total > 0 ? Math.round((offerCount / total) * 100) : 0,
    interviewCount,
    offerCount,
    respondedCount: apps.filter(app => ['rejected', 'interview', 'offer', 'accepted'].includes(app.status)).length,
  };
};
