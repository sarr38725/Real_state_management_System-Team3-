import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { propertyService } from '../services/propertyService';
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

  const loadProperties = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const filterParams = {
        status: 'available',
      };

      if (filters.type) filterParams.property_type = filters.type;
      if (filters.location) filterParams.city = filters.location;
      if (filters.minPrice) filterParams.min_price = filters.minPrice;
      if (filters.maxPrice) filterParams.max_price = filters.maxPrice;
      if (filters.bedrooms) filterParams.bedrooms = filters.bedrooms;

      const response = await propertyService.getAllProperties(filterParams);
      const list = response.properties.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.property_type,
        listingType: p.listing_type,
        price: p.price,
        location: {
          address: p.address,
          city: p.city,
          state: p.state,
          zipCode: p.zip_code,
          country: p.country,
        },
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area_sqft,
        yearBuilt: p.year_built,
        status: p.status,
        featured: p.featured,
        images: p.primary_image ? [p.primary_image] : [],
        agent: {
          name: p.agent_name,
          email: p.agent_email,
          phone: p.agent_phone,
        },
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));

      setProperties(list);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFeaturedProperties = useCallback(async () => {
    try {
      const response = await propertyService.getFeaturedProperties();
      const list = response.properties.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.property_type,
        listingType: p.listing_type,
        price: p.price,
        location: {
          address: p.address,
          city: p.city,
          state: p.state,
          zipCode: p.zip_code,
          country: p.country,
        },
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area_sqft,
        yearBuilt: p.year_built,
        status: p.status,
        featured: p.featured,
        images: p.primary_image ? [p.primary_image] : [],
        agent: {
          name: p.agent_name,
          email: p.agent_email,
          phone: p.agent_phone,
        },
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));

      setFeaturedProperties(list);
    } catch (error) {
      console.error('Error loading featured properties:', error);
      setFeaturedProperties([]);
    }
  }, []);

  const loadUserProperties = useCallback(async () => {
    if (!user) {
      console.error('User must be logged in to load user properties');
      return;
    }
    setLoading(true);
    try {
      const response = await propertyService.getAllProperties();
      const list = response.properties
        .filter(p => p.agent_id === user.id)
        .map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.property_type,
          listingType: p.listing_type,
          price: p.price,
          location: {
            address: p.address,
            city: p.city,
            state: p.state,
            zipCode: p.zip_code,
            country: p.country,
          },
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area_sqft,
          yearBuilt: p.year_built,
          status: p.status,
          featured: p.featured,
          images: p.primary_image ? [p.primary_image] : [],
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        }));

      setProperties(list);
    } catch (error) {
      console.error('Error loading user properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addProperty = useCallback(async (propertyData, imageFiles = []) => {
    if (!user) return { success: false, error: 'User must be logged in to add properties' };

    try {
      const imageUrls = [];
      if (Array.isArray(imageFiles) && imageFiles.length) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('image', file);
          imageUrls.push(`/uploads/${file.name}`);
        }
      }

      const payload = {
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.type,
        listing_type: propertyData.listingType || 'sale',
        price: parseFloat(propertyData.price),
        address: propertyData.location.address,
        city: propertyData.location.city,
        state: propertyData.location.state,
        zip_code: propertyData.location.zipCode,
        country: propertyData.location.country || 'USA',
        bedrooms: parseInt(propertyData.bedrooms) || 0,
        bathrooms: parseInt(propertyData.bathrooms) || 0,
        area_sqft: parseInt(propertyData.area),
        year_built: parseInt(propertyData.yearBuilt) || null,
        featured: propertyData.featured || false,
        images: imageUrls,
      };

      const response = await propertyService.createProperty(payload);
      await loadProperties();

      return { success: true, id: response.propertyId };
    } catch (error) {
      console.error('Error adding property:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }, [user, loadProperties]);

  const editProperty = useCallback(async (id, propertyData, newImageFiles = []) => {
    if (!user) return { success: false, error: 'User must be logged in to edit properties' };

    try {
      const imageUrls = Array.isArray(propertyData.images) ? [...propertyData.images] : [];

      if (Array.isArray(newImageFiles) && newImageFiles.length) {
        for (const file of newImageFiles) {
          imageUrls.push(`/uploads/${file.name}`);
        }
      }

      const payload = {
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.type,
        listing_type: propertyData.listingType || 'sale',
        price: parseFloat(propertyData.price),
        address: propertyData.location.address,
        city: propertyData.location.city,
        state: propertyData.location.state,
        zip_code: propertyData.location.zipCode,
        country: propertyData.location.country || 'USA',
        bedrooms: parseInt(propertyData.bedrooms) || 0,
        bathrooms: parseInt(propertyData.bathrooms) || 0,
        area_sqft: parseInt(propertyData.area),
        year_built: parseInt(propertyData.yearBuilt) || null,
        status: propertyData.status || 'available',
        featured: propertyData.featured || false,
      };

      await propertyService.updateProperty(id, payload);
      await loadProperties();

      return { success: true };
    } catch (error) {
      console.error('Error updating property:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }, [user, loadProperties]);

  const removeProperty = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User must be logged in to delete properties' };

    try {
      await propertyService.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setFeaturedProperties(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting property:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }, [user]);

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
