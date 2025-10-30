import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSchedules(user.id);
    }
  }, [user]);

  const loadAllSchedules = async () => {
    setLoading(true);
    try {
      setSchedules([]);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSchedules = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      setSchedules([]);
    } catch (error) {
      console.error('Error loading user schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData) => {
    if (!user) {
      return { success: false, error: 'User must be logged in' };
    }

    try {
      return { success: true, id: Date.now() };
    } catch (error) {
      console.error('Error creating schedule:', error);
      return { success: false, error: error.message };
    }
  };

  const updateScheduleStatus = async (scheduleId, status, notes = '') => {
    try {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, status, adminNotes: notes, updatedAt: new Date() }
            : schedule
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating schedule status:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    schedules,
    loading,
    loadAllSchedules,
    loadUserSchedules,
    createSchedule,
    updateScheduleStatus,
    deleteSchedule
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
