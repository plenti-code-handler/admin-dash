'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = buildApiUrl('/v1/superuser/me/login', {
        email,
        password
      });
      const response = await axiosClient.get(url);
      const data = response.data;

      if (data.access_token) {
        login(data.access_token, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        });
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-[#5F22D9] relative">
        {/* Optional: Add a background pattern here */}
        <div className="absolute inset-0 opacity-30 z-0" style={{
          backgroundImage: "url('/pattern.svg')", // Replace with your pattern asset
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover'
        }} />
        <div className="relative z-10 px-16">
          <div className="flex items-center mb-8">
            <img
              src="https://plenti-company-logo.s3.us-east-2.amazonaws.com/plenti-logo-white.png"
              alt="plenti logo"
              width={170}
              height={170}
              className="mr-4"
            />
          </div>
          <div>
            <span className="text-white text-2xl font-semibold leading-snug">
              India&apos;s First<br />
              Surplus Food Marketplace
            </span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white min-h-screen">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login to your account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Want to register your business?{' '}
            <a href="/register" className="text-[#5F22D9] font-semibold hover:underline">Register</a>
          </p>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
            <div>
              <input
                type="email"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#5F22D9] focus:border-[#5F22D9] text-gray-900"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#5F22D9] focus:border-[#5F22D9] text-gray-900"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#5F22D9] hover:bg-[#5F22D9] text-white font-semibold rounded-md transition"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-gray-400 hover:text-[#5F22D9]">Forget Password</a>
          </div>
        </div>
      </div>
    </div>
  );
}