import React, { useState } from 'react';
import api from '../api';

export default function LoginModal({ onClose }){
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const path = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { email, password, name } : { email, password };
    try{
      const { data } = await api.post(path, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onClose(); location.reload();
    }catch(e){
      alert(e.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">{isRegister? 'Sign Up' : 'Sign In'}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {isRegister && <input className="w-full p-3 border rounded-lg" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} />}
          <input className="w-full p-3 border rounded-lg" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full py-3 bg-green-600 text-white rounded-xl">{isRegister? 'Create account' : 'Sign in'}</button>
        </form>
        <div className="mt-3 text-center text-sm">
          {!isRegister ? <>Don’t have an account? <button className="text-green-600" onClick={()=>setIsRegister(true)}>Sign up here</button></> :
            <>Already have an account? <button className="text-green-600" onClick={()=>setIsRegister(false)}>Sign in</button></>}
        </div>
      </div>
    </div>
  )
}
