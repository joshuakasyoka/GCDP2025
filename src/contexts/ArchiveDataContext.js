import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { studentsData as staticData } from '../data/studentsData';
import { archiveApi } from '../services/archiveApi';

const ArchiveDataContext = createContext(null);

export function ArchiveDataProvider({ children }) {
  const [data, setData] = useState(staticData);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('static');

  const refresh = useCallback(async () => {
    try {
      const result = await archiveApi.getStudents();
      if (result.students?.length) {
        setData(result);
        setSource('api');
      }
    } catch {
      setData(staticData);
      setSource('static');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ArchiveDataContext.Provider value={{ data, loading, source, refresh, setData }}>
      {children}
    </ArchiveDataContext.Provider>
  );
}

export function useArchiveData() {
  const ctx = useContext(ArchiveDataContext);
  if (!ctx) throw new Error('useArchiveData must be used within ArchiveDataProvider');
  return ctx;
}
