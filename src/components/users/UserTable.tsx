'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import type { User } from '@/types/user';
import { buildApiUrl } from '@/config';

interface UserTableProps {
  onUserSelect: (user: User) => void;
  searchQuery: string;
}

// Helper function to format date
const formatDate = (timestamp: string | number | null) => {
  try {
    if (!timestamp) return 'N/A';
    
    const date = new Date(Number(timestamp) * 1000);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to handle null/undefined/NaN values
const formatValue = (value: any, defaultValue = 'N/A') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return defaultValue;
  }
  return String(value);
};

export default function UserTable({ onUserSelect, searchQuery }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const searchTerm = localSearch.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone_number?.includes(searchTerm)
    );
  }, [users, localSearch]);

  // Handle next page
  const handleNextPage = () => {
    setCurrentPage(currentPage => {
      const nextPage = currentPage + 1;
      logger.info('Moving to next page:', nextPage);
      return nextPage;
    });
  };

  // Handle previous page
  const handlePrevPage = () => {
    setCurrentPage(currentPage => {
      const prevPage = Math.max(1, currentPage - 1);
      logger.info('Moving to previous page:', prevPage);
      return prevPage;
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = buildApiUrl('/v1/superuser/user/get', {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      logger.info('Users response:', data);

      const transformedUsers = data.response.map((user: any) => ({
        id: formatValue(user.id, 'N/A'),
        name: formatValue(user.name, 'N/A'),
        email: formatValue(user.email, 'N/A'),
        phone: formatValue(user.phone_number, 'N/A'),
        status: user.is_active ? 'active' : 'inactive',
        joinedDate: formatDate(user.created_at) || 'N/A',
      }));

      setUsers(transformedUsers);
      setTotalItems(data.total || transformedUsers.length);
      setTotalPages(Math.max(1, Math.ceil(data.total / itemsPerPage)));
      
    } catch (error) {
      logger.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Local Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search in table..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              onClick={() => onUserSelect(user)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-4 py-3 text-sm text-gray-900">{String(user.id)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{String(user.name)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{String(user.email)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{String(user.phone)}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {String(user.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{String(user.joinedDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show "No results found" when filtered results are empty */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No results found
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} · 
            <span className="text-gray-500 ml-1">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-md border disabled:opacity-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-md border disabled:opacity-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}