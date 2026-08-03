'use client';
import { useState } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import axiosClient from '../../AxiosClient';
import { useAuth } from '@/contexts/AuthContext';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleGoogleAuth = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Google sign-in failed. Please try again.');
        return;
      }

      const response = await axiosClient.post(
        '/v1/superuser/me/login/google',
        null,
        {
          params: { token: credentialResponse.credential },
        }
      );

      const data = response.data;
      if (data.access_token) {
        login(data.access_token, {
          id: data.id || '',
          name: data.username || data.name || '',
          email: data.email || '',
          role: data.role || 'superuser',
        });
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  return {
    loading,
    error,
    handleGoogleAuth,
    handleGoogleError,
  };
};
