'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Match backend Google JWT lifetime (90 days) so middleware cookie outlives browser restarts
const TOKEN_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

function setAuthCookie(token: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '; Secure'
    : '';
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearAuthCookie() {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // localStorage is the source of truth (same as vendor-web-app)
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      // Keep middleware cookie in sync / rehydrate after session cookie loss
      setAuthCookie(token);
      setIsAuthenticated(true);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthCookie(token);
    setIsAuthenticated(true);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    clearAuthCookie();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
