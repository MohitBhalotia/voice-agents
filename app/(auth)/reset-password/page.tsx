'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const reset = async () => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  return <div>
    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
    <button onClick={reset}>Reset Password</button>
    <p>{msg}</p>
  </div>;
}