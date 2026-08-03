'use client';
import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleAuthButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = 'continue_with',
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(240);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full flex justify-center">
      {/* Narrower on small screens; fuller from sm up */}
      <div ref={containerRef} className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-[280px]">
        <GoogleLogin
          key={width}
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          width={String(width)}
          text={text}
          shape="pill"
          logo_alignment="left"
        />
      </div>
    </div>
  );
}
