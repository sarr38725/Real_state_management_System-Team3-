/* eslint react-refresh/only-export-components: ["warn", { "allowExportNames": ["useProperties"] }] */
// src/context/PropertyContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db } from '../firebase/db';
import { storage } from '../firebase/storage';
import { useAuth } from './AuthContext';

const PropertyContext = createContext();

export const useProperties = () => {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperties must be used within a PropertyProvider');
  return ctx;
};

export const PropertyProvider = ({ children }) => {
  const { user, isAdminMode } = useAuth();
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // --------- helpers ----------
  const uploadImages = useCallback(async (imageFiles) => {
    const now = Date.now();
    const uploads = imageFiles.map(async (file, idx) => {
      const storageRef = ref(storage, `properties/${now}_${idx}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      return getDownloadURL(snap.ref);
    });
    return Promise.all(uploads);
  }, []);

  // --------- loads ----------
  const loadProperties = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const colRef = collection(db, 'properties');

      // Always show only approved in public browse
      let qRef = query(colRef, where('status', '==', 'approved'));

      // Firestore-side filters
      if (filters.type) {
        qRef = query(qRef, where('type', '==', filters.type));
      }
      if (typeof filters.minPrice === 'number') {
        qRef = query(qRef, where('price', '>=', filters.minPrice));
      }
      if (typeof filters.maxPrice === 'number') {
        qRef = query(qRef, where('price', '<=', filters.maxPrice));
      }

      const snap = await getDocs(qRef);
      let list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : (data?.updatedAt ? new Date(data.updatedAt) : new Date())
        };
      });

      // Client-side location filter (substring match across address/city/state/zip)
      if (filters.location) {
        const term = String(filters.location).toLowerCase();
        list = list.filter(p => {
          const s = [
            p?.location?.address, p?.location?.city, p?.location?.state, p?.location?.zipCode
          ].filter(Boolean).join(' ').toLowerCase();
          return s.includes(term);
        });
      }

      // Newest first
      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));

      setProperties(list);
      // console.log('Properties loaded:', list.length);
    } catch (e) {
      console.error('Error loading properties from Firebase:', e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFeaturedProperties = useCallback(async () => {
    try {
      const colRef = collection(db, 'properties');
      const qRef = query(colRef, where('featured', '==', true), where('status', '==', 'approved'));

      const snap = await getDocs(qRef);
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : (data?.updatedAt ? new Date(data.updatedAt) : new Date())
        };
      });

      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      setFeaturedProperties(list);
      // console.log('Featured loaded:', list.length);
    } catch (e) {
      console.error('Error loading featured properties from Firebase:', e);
      setFeaturedProperties([]);
    }
  }, []);

  const loadUserProperties = useCallback(async (userId) => {
    const uid = userId || user?.uid;
    if (!uid) {
      console.error('User must be logged in to load user properties');
      return;
    }
    setLoading(true);
    try {
      const colRef = collection(db, 'properties');
      const qRef = query(colRef, where('ownerId', '==', uid));

      const snap = await getDocs(qRef);
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : (data?.updatedAt ? new Date(data.updatedAt) : new Date())
        };
      });
      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      setProperties(list);
    } catch (e) {
      console.error('Error loading user properties from Firebase:', e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // --------- mutations ----------
  const addProperty = useCallback(async (propertyData, imageFiles = []) => {
    if (!user) return { success: false, error: 'User must be logged in to add properties' };

    try {
      // 1) upload images
      let imageUrls = [];
      if (Array.isArray(imageFiles) && imageFiles.length) {
        imageUrls = await uploadImages(imageFiles);
      }

      // 2) doc payload
      const payload = {
        ...propertyData,
        images: imageUrls,
        ownerId: user.uid,                // ✅ owner is the actual uid (rules friendly)
        createdByRole: isAdminMode ? 'admin' : 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: propertyData?.status || 'approved', // or 'pending' if you want review flow
      };

      // 3) write
      const docRef = await addDoc(collection(db, 'properties'), payload);

      // 4) local state
      const newProp = {
        id: docRef.id,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProperties(prev => [newProp, ...prev]);
      if (newProp.featured) setFeaturedProperties(prev => [newProp, ...prev]);

      return { success: true, id: docRef.id };
    } catch (e) {
      console.error('Error adding property to Firebase:', e);
      return { success: false, error: e.message };
    }
  }, [user, isAdminMode, uploadImages]);

  const editProperty = useCallback(async (id, propertyData, newImageFiles = []) => {
    if (!user) return { success: false, error: 'User must be logged in to edit properties' };
    try {
      let imageUrls = Array.isArray(propertyData.images) ? [...propertyData.images] : [];

      if (Array.isArray(newImageFiles) && newImageFiles.length) {
        const more = await uploadImages(newImageFiles);
        imageUrls.push(...more);
      }

      const updated = {
        ...propertyData,
        images: imageUrls,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'properties', id), updated);

      setProperties(prev => prev.map(p => (p.id === id ? { ...p, ...updated, id, updatedAt: new Date() } : p)));
      setFeaturedProperties(prev => prev.map(p => (p.id === id ? { ...p, ...updated, id, updatedAt: new Date() } : p)));

      return { success: true };
    } catch (e) {
      console.error('Error updating property in Firebase:', e);
      return { success: false, error: e.message };
    }
  }, [user, uploadImages]);

  const removeProperty = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User must be logged in to delete properties' };
    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(prev => prev.filter(p => p.id !== id));
      setFeaturedProperties(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (e) {
      console.error('Error deleting property from Firebase:', e);
      return { success: false, error: e.message };
    }
  }, [user]);

  // init on mount
  useEffect(() => {
    loadProperties();
    loadFeaturedProperties();
  }, [loadProperties, loadFeaturedProperties]);

  const value = {
    properties,
    featuredProperties,
    loading,
    loadProperties,
    loadUserProperties,
    loadFeaturedProperties,
    addProperty,
    editProperty,
    removeProperty
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
};
