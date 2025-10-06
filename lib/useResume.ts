import { useState, useEffect } from 'react';
import { ResumeData } from './types';

export function useResume() {
  const [resumeData, setResumeData] = useState<ResumeData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('resumeData');
    if (stored) {
      setResumeData(JSON.parse(stored));
    }
  }, []);

  const updateProgress = (id: number, type: 'movie' | 'tv', progress: number) => {
    const existingIndex = resumeData.findIndex(r => r.id === id && r.type === type);
    const newData: ResumeData = {
      id,
      type,
      progress,
      lastWatched: new Date().toISOString(),
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...resumeData];
      updated[existingIndex] = newData;
    } else {
      updated = [...resumeData, newData];
    }

    setResumeData(updated);
    localStorage.setItem('resumeData', JSON.stringify(updated));
  };

  const getProgress = (id: number, type: 'movie' | 'tv') => {
    const item = resumeData.find(r => r.id === id && r.type === type);
    return item ? item.progress : 0;
  };

  const markAsWatched = (id: number, type: 'movie' | 'tv') => {
    updateProgress(id, type, 100);
  };

  const startOver = (id: number, type: 'movie' | 'tv') => {
    updateProgress(id, type, 0);
  };

  const isWatched = (id: number, type: 'movie' | 'tv') => {
    return getProgress(id, type) === 100;
  };

  return {
    resumeData,
    updateProgress,
    getProgress,
    markAsWatched,
    startOver,
    isWatched,
  };
}