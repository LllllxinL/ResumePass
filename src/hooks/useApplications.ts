import { useState, useEffect, useCallback } from 'react';
import type { Application, Interview } from '../types';
import { applicationStorage, interviewStorage } from '../utils/storage';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationStorage.getAll().then(apps => {
      setApplications(apps);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const apps = await applicationStorage.getAll();
    setApplications(apps);
  }, []);

  const createApplication = useCallback(
    async (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newApp = await applicationStorage.create(data);
      setApplications(prev => [newApp, ...prev]);
      return newApp;
    },
    []
  );

  const updateApplication = useCallback(async (id: string, updates: Partial<Application>) => {
    const updated = await applicationStorage.update(id, updates);
    if (updated) {
      setApplications(prev => prev.map(app => (app.id === id ? updated : app)));
    }
    return updated;
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    const success = await applicationStorage.delete(id);
    if (success) {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
    return success;
  }, []);

  const getById = useCallback(async (id: string) => {
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
    const load = async () => {
      const data = applicationId
        ? await interviewStorage.getByApplicationId(applicationId)
        : await interviewStorage.getAll();
      setInterviews(data);
      setLoading(false);
    };
    load();
  }, [applicationId]);

  const createInterview = useCallback(
    async (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newInterview = await interviewStorage.create(data);
      setInterviews(prev => [...prev, newInterview]);
      return newInterview;
    },
    []
  );

  const updateInterview = useCallback(async (id: string, updates: Partial<Interview>) => {
    const updated = await interviewStorage.update(id, updates);
    if (updated) {
      setInterviews(prev => prev.map(i => (i.id === id ? updated : i)));
    }
    return updated;
  }, []);

  const deleteInterview = useCallback(async (id: string) => {
    const success = await interviewStorage.delete(id);
    if (success) {
      setInterviews(prev => prev.filter(i => i.id !== id));
    }
    return success;
  }, []);

  const refresh = useCallback(async () => {
    const data = applicationId
      ? await interviewStorage.getByApplicationId(applicationId)
      : await interviewStorage.getAll();
    setInterviews(data);
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
