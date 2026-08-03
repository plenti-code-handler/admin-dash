'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleAuthButton from '@/components/common/GoogleAuthButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { loading, error, handleGoogleAuth, handleGoogleError } = useGoogleAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center px-5 py-10 sm:px-8 overflow-hidden bg-[#FAFAFB]">
      
      <main className="relative z-10 w-full max-w-[400px] login-enter">
        {/* Brand */}
        <div className="flex flex-col items-center rounded-2xl text-center border border-gray-200/80 bg-white/90 backdrop-blur-sm px-5 py-6 sm:px-7 sm:py-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]">
          <Image
            src="/images/plenti-logo.png"
            alt="Plenti"
            width={160}
            height={54}
            priority
            className="h-10 sm:h-11 w-auto object-contain mb-8 rounded-lg"
          />
          <h1 className="text-[1.65rem] sm:text-[1.75rem] font-semibold tracking-tight text-gray-900 leading-tight">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-[0.9375rem] text-gray-500 leading-relaxed max-w-[280px]">
            Sign in with your  Plenti account
          </p>
          <div className="relative px-6 py-6 sm:px-7 sm:py-7">
            <div className={loading ? 'opacity-40 pointer-events-none select-none' : ''}>
              {error && !loading && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-center text-[13px] text-red-600 leading-snug"
                >
                  {error}
                </div>
              )}
              <div className="relative px-6 py-6 sm:px-7 sm:py-7">
                <GoogleAuthButton
                  onSuccess={handleGoogleAuth}
                  onError={handleGoogleError}
                  text="continue_with"
                />
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-[2px] z-10">
                <div className="relative h-9 w-9" aria-hidden>
                  <div className="absolute inset-0 rounded-full border-[2.5px] border-[#5F22D9]/15" />
                  <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#5F22D9] animate-spin" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">Signing in…</p>
              </div>
            )}
          </div>
          <p className="mt-8 text-center text-xs text-gray-400 tracking-wide">
            Plenti internal access only
          </p>
        </div>

        {/* Sign-in panel */}

      </main>
    </div>
  );
}
