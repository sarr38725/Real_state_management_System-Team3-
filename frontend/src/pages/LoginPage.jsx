import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signIn } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUI();
  const { login, ADMIN_EMAILS } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Universal login (works for both users and admins)
    const result = await login(formData.email, formData.password);

    if (!result.success) {
      showToast('Login failed. Please check your credentials.', 'error');
    } else {
      // Check if user is admin and redirect accordingly
      if (ADMIN_EMAILS.includes(formData.email)) {
        showToast('Welcome Admin!', 'success');
        navigate('/admin', { replace: true });
      } else {
        showToast('Welcome back!', 'success');
        navigate(from, { replace: true });
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </p>
         
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                />
                <button
                  type="button"
                  className="absolute text-gray-400 right-3 top-8 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;