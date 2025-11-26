'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import axiosClient from '../../AxiosClient';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const url = buildApiUrl('/v1/superuser/me/profile');
      const response = await axiosClient.get(url);
      setProfile(response.data);
    } catch (error) {
      logger.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };
  
  return { profile, loading, error, refetchProfile: fetchProfile };
} 