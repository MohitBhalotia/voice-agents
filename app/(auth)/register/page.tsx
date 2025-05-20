'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const register = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (res.ok) setTimeout(() => router.push('/login'), 2000);
  };

  return <div>
    <h2>Register</h2>
    <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
    <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
    <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button onClick={register}>Register</button>
    {msg && <p>{msg}</p>}
  </div>;
}