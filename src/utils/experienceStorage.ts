import { supabase } from '../lib/supabase';
import type { Experience, UserExperiences } from '../services/cozeApi';

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');
  return user.id;
};

// 把数据库行转换为 Experience 对象
const rowToExperience = (row: any): Experience => ({
  id: row.id,
  type: row.type,
  title: row.title ?? '',
  organization: row.organization,
  role: row.role,
  duration: row.duration,
  description: row.description ?? '',
  keywords: row.keywords ?? [],
});

// 获取所有经历，重建 UserExperiences 结构
export const getAllExperiences = async (): Promise<UserExperiences> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return { internships: [], projects: [], campus: [], skills: [] };
  }

  const rows = data ?? [];
  return {
    internships: rows.filter(r => r.type === 'internship').map(rowToExperience),
    projects: rows.filter(r => r.type === 'project').map(rowToExperience),
    campus: rows.filter(r => r.type === 'campus').map(rowToExperience),
    skills: rows.filter(r => r.type === 'skill').map(r => r.skill_name as string),
  };
};

// 添加一条经历
export const addExperience = async (experience: Omit<Experience, 'id'>): Promise<Experience> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('experiences')
    .insert({
      user_id: userId,
      type: experience.type,
      title: experience.title ?? null,
      organization: experience.organization ?? null,
      role: experience.role ?? null,
      duration: experience.duration ?? null,
      description: experience.description ?? null,
      keywords: experience.keywords ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return rowToExperience(data);
};

// 删除一条经历
export const deleteExperience = async (id: string, _type: Experience['type']): Promise<boolean> => {
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  return !error;
};

// 更新技能列表（先删除所有 skill 行，再批量插入）
export const updateSkills = async (skills: string[]): Promise<void> => {
  const userId = await getUserId();
  await supabase.from('experiences').delete().eq('user_id', userId).eq('type', 'skill');

  if (skills.length === 0) return;

  const rows = skills.map(name => ({
    user_id: userId,
    type: 'skill',
    skill_name: name,
    description: '',
  }));
  await supabase.from('experiences').insert(rows);
};

// 检查是否有任何经历
export const hasAnyExperiences = async (): Promise<boolean> => {
  const { count } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true });
  return (count ?? 0) > 0;
};
