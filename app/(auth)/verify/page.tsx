'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const [message, setMessage] = useState('Verifying...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetch(`/api/auth/verify?token=${token}`).then(res => res.json()).then(data => setMessage(data.message || data.error));
    }
  }, [searchParams]);

  return <div>{message}</div>;
}