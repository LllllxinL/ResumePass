import type { Experience, UserExperiences } from '../services/cozeApi';

const STORAGE_KEY = 'interntrack_experiences';

// 获取当前用户ID
const getCurrentUserId = (): string | null => {
  const auth = localStorage.getItem('interntrack_auth');
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

// 获取用户特定的storage key
const getStorageKey = (): string => {
  const userId = getCurrentUserId();
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
};

// 获取所有经历
export const getAllExperiences = (): UserExperiences => {
  const key = getStorageKey();
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return {
    internships: [],
    projects: [],
    campus: [],
    skills: [],
  };
};

// 保存所有经历
export const saveAllExperiences = (experiences: UserExperiences): void => {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(experiences));
};

// 添加经历
export const addExperience = (experience: Omit<Experience, 'id'>): Experience => {
  const experiences = getAllExperiences();
  const newExperience: Experience = {
    ...experience,
    id: crypto.randomUUID(),
  };

  if (experience.type === 'internship') {
    experiences.internships.push(newExperience);
  } else if (experience.type === 'project') {
    experiences.projects.push(newExperience);
  } else if (experience.type === 'campus') {
    experiences.campus.push(newExperience);
  }

  saveAllExperiences(experiences);
  return newExperience;
};

// 删除经历
export const deleteExperience = (id: string, type: Experience['type']): boolean => {
  const experiences = getAllExperiences();

  if (type === 'internship') {
    experiences.internships = experiences.internships.filter(e => e.id !== id);
  } else if (type === 'project') {
    experiences.projects = experiences.projects.filter(e => e.id !== id);
  } else if (type === 'campus') {
    experiences.campus = experiences.campus.filter(e => e.id !== id);
  }

  saveAllExperiences(experiences);
  return true;
};

// 更新经历
export const updateExperience = (id: string, updates: Partial<Experience>): Experience | null => {
  const experiences = getAllExperiences();
  const type = updates.type;

  let target: Experience | undefined;
  if (type === 'internship') {
    target = experiences.internships.find(e => e.id === id);
  } else if (type === 'project') {
    target = experiences.projects.find(e => e.id === id);
  } else if (type === 'campus') {
    target = experiences.campus.find(e => e.id === id);
  }

  if (target) {
    Object.assign(target, updates);
    saveAllExperiences(experiences);
    return target;
  }
  return null;
};

// 更新技能
export const updateSkills = (skills: string[]): void => {
  const experiences = getAllExperiences();
  experiences.skills = skills;
  saveAllExperiences(experiences);
};

// 检查是否有经历
export const hasAnyExperiences = (): boolean => {
  const experiences = getAllExperiences();
  return (
    experiences.internships.length > 0 ||
    experiences.projects.length > 0 ||
    experiences.campus.length > 0 ||
    experiences.skills.length > 0
  );
};

// 获取经历总数
export const getExperienceCount = (): number => {
  const experiences = getAllExperiences();
  return (
    experiences.internships.length +
    experiences.projects.length +
    experiences.campus.length
  );
};
