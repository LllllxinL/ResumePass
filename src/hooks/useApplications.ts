import { useState, useEffect, useCallback } from 'react';
import type { Application, Interview } from '../types';
import { applicationStorage, interviewStorage } from '../utils/storage';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    const apps = applicationStorage.getAll();
    setApplications(apps);
    setLoading(false);
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    const apps = applicationStorage.getAll();
    setApplications(apps);
  }, []);

  // 创建投递记录
  const createApplication = useCallback(
    (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newApp = applicationStorage.create(data);
      setApplications((prev) => [...prev, newApp]);
      return newApp;
    },
    []
  );

  // 更新投递记录
  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    const updated = applicationStorage.update(id, updates);
    if (updated) {
      setApplications((prev) => prev.map((app) => (app.id === id ? updated : app)));
    }
    return updated;
  }, []);

  // 删除投递记录
  const deleteApplication = useCallback((id: string) => {
    const success = applicationStorage.delete(id);
    if (success) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
    return success;
  }, []);

  // 根据ID获取
  const getById = useCallback((id: string) => {
    return applicationStorage.getById(id);
  }, []);

  return {
    applications,
    loading,
    refresh,
    createApplication,
    updateApplication,
    deleteApplication,
    getById,
  };
};

export const useInterviews = (applicationId?: string) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      const data = interviewStorage.getByApplicationId(applicationId);
      setInterviews(data);
    } else {
      const data = interviewStorage.getAll();
      setInterviews(data);
    }
    setLoading(false);
  }, [applicationId]);

  const createInterview = useCallback(
    (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newInterview = interviewStorage.create(data);
      setInterviews((prev) => [...prev, newInterview]);
      return newInterview;
    },
    []
  );

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    const updated = interviewStorage.update(id, updates);
    if (updated) {
      setInterviews((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
    return updated;
  }, []);

  const deleteInterview = useCallback((id: string) => {
    const success = interviewStorage.delete(id);
    if (success) {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    }
    return success;
  }, []);

  const refresh = useCallback(() => {
    if (applicationId) {
      const data = interviewStorage.getByApplicationId(applicationId);
      setInterviews(data);
    } else {
      const data = interviewStorage.getAll();
      setInterviews(data);
    }
  }, [applicationId]);

  return {
    interviews,
    loading,
    createInterview,
    updateInterview,
    deleteInterview,
    refresh,
  };
};
