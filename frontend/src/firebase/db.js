import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import app from './app';

export const db = getFirestore(app);

// Collections
export const usersCollection = collection(db, 'users');
export const propertiesCollection = collection(db, 'properties');
export const favoritesCollection = collection(db, 'favorites');