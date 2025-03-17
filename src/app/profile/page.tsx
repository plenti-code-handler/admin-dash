'use client';
import { useState } from 'react';
import { UserCircleIcon, CameraIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@plenti.co.in',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API call here
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-pattern relative">
      {/* Floating Back Button */}
      <Link
        href="/dashboard"
        className="fixed top-8 left-8 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Back to Dashboard"
      >
        <HomeIcon className="w-6 h-6 text-[#5F22D9]" />
      </Link>

      <div className="max-w-4xl mx-auto pt-12 px-4">
        {/* Profile Header Card */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 bg-[#5F22D9]/10 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-24 h-24 text-[#5F22D9]" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <CameraIcon className="w-5 h-5 text-[#5F22D9]" />
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{formData.name}</h1>
            <p className="text-gray-500">{formData.email}</p>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#5F22D9] disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#5F22D9] disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            {isEditing && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">
                  Change Password
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#5F22D9]"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#5F22D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#5F22D9]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#5F22D9] text-white rounded-lg text-sm font-medium hover:bg-[#5F22D9]/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-[#5F22D9] text-white rounded-lg text-sm font-medium hover:bg-[#5F22D9]/90 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}