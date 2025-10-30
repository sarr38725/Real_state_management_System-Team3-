import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './app';

export const storage = getStorage(app);

export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

export const uploadMultipleImages = async (files, basePath) => {
  try {
    const uploadPromises = files.map((file, index) => 
      uploadImage(file, `${basePath}/image_${index}_${Date.now()}`)
    );
    
    const results = await Promise.all(uploadPromises);
    const urls = results.filter(result => result.url).map(result => result.url);
    
    return { urls, error: null };
  } catch (error) {
    return { urls: [], error: error.message };
  }
};

export const deleteImage = async (url) => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};