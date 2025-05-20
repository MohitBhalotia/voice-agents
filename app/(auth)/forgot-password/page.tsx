'use client';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  return <div>
    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" />
    <button onClick={submit}>Send Reset Link</button>
    <p>{msg}</p>
  </div>;
}