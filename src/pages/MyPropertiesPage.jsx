import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { useUI } from '../context/UIContext';
import PropertyCard from '../components/property/PropertyCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyPropertiesPage = () => {
  const { userData } = useAuth();
  const { properties, loading, removeProperty, loadUserProperties } = useProperties();
  const { showToast } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    // No need to load separately, properties are already loaded in context
  }, []);

  // Filter properties for current user (including demo admin)
  const userProperties = properties.filter(p => 
    p.ownerId === userData?.uid || 
    p.ownerId === 'demo-admin-123' ||
    (userData?.role === 'admin' && p.ownerId === 'admin')
  );

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const result = await removeProperty(propertyId);
      if (result.success) {
        showToast('Property deleted successfully!', 'success');
      } else {
        showToast('Failed to delete property. Please try again.', 'error');
      }
    }
  };

  const handleEditProperty = (propertyId) => {
    navigate(`/dashboard/properties/edit/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">
            Manage your property listings
          </p>
        </div>
        
        {(userData?.role === 'seller' || userData?.role === 'admin') && (
          <Link to="/dashboard/properties/add">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Property
            </Button>
          </Link>
        )}
      </motion.div>

      {userProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-white rounded-lg shadow-sm p-8">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first property listing
            </p>
            {(userData?.role === 'seller' || userData?.role === 'admin') && (
              <Link to="/dashboard/properties/add">
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <PropertyCard property={property} />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={() => handleEditProperty(property.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                  title="Edit Property"
                >
                  <PencilIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => handleDeleteProperty(property.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                  title="Delete Property"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  property.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800'
                    : property.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPropertiesPage;