'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const login = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) router.push('/dashboard');
    else setMsg(data.error);
  };

  return <div>
    <h2>Login</h2>
    <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
    <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button onClick={login}>Login</button>
    {msg && <p>{msg}</p>}
  </div>;
}