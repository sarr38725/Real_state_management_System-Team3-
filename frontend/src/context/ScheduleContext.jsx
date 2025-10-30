import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/db';
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
      loadUserSchedules(user.uid);
    }
  }, [user]);

  // Load all schedules (for admin)
  const loadAllSchedules = async () => {
    setLoading(true);
    try {
      const schedulesRef = collection(db, 'schedules');
      const q = query(schedulesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const schedulesData = [];
      
      querySnapshot.forEach((doc) => {
        schedulesData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          scheduledDate: doc.data().scheduledDate?.toDate() || new Date()
        });
      });
      
      setSchedules(schedulesData);
      console.log('All schedules loaded:', schedulesData.length);
      
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user's schedules
  const loadUserSchedules = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Simple query without orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'schedules'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      // Sort in memory instead of using Firestore orderBy
      const userSchedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date()
      })).sort((a, b) => {
        // Sort by createdAt descending (newest first)
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });
      
      setSchedules(userSchedulesData);
      console.log('User schedules loaded:', userSchedulesData.length);
      
    } catch (error) {
      console.error('Error loading user schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new schedule
  const createSchedule = async (scheduleData) => {
    if (!user) {
      return { success: false, error: 'User must be logged in' };
    }
    
    try {
      const newScheduleData = {
        ...scheduleData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      
      const docRef = await addDoc(collection(db, 'schedules'), newScheduleData);
      console.log('Schedule created with ID:', docRef.id);
      
      const newSchedule = {
        id: docRef.id,
        ...newScheduleData,
        createdAt: new Date(),
        scheduledDate: new Date(scheduleData.scheduledDate)
      };
      
      setSchedules(prev => [newSchedule, ...prev]);
      
      return { success: true, id: docRef.id };

    } catch (error) {
      console.error('Error creating schedule:', error);
      return { success: false, error: error.message };
    }
  };

  // Update schedule status (for admin)
  const updateScheduleStatus = async (scheduleId, status, notes = '') => {
    try {
      const scheduleRef = doc(db, 'schedules', scheduleId);
      await updateDoc(scheduleRef, {
        status,
        adminNotes: notes,
        updatedAt: serverTimestamp()
      });
      
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

  // Delete schedule
  const deleteSchedule = async (scheduleId) => {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
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