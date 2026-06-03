import { useState } from 'react';
import type { View } from '../types';

interface LoginProps {
  setIsAdmin: (isAdmin: boolean) => void;
  navigate: (view: View) => void;
}

export default function Login({ setIsAdmin, navigate }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'love123') {
      setIsAdmin(true);
      navigate('admin');
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-3xl shadow-xl border border-theme-accent1 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-theme-dark mb-6">Khu Vực Quản Trị</h2>
      {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded">{error}</p>}
      
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
          <input 
            type="text" 
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-theme-dark focus:ring-2 focus:ring-theme-accent1 transition-all" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input 
            type="password" 
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-theme-dark focus:ring-2 focus:ring-theme-accent1 transition-all" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="mt-2 bg-theme-dark text-white p-4 rounded-xl font-bold text-lg hover:bg-[#8A5B66] shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Đăng Nhập
        </button>
      </form>
      <p className="text-sm text-center mt-6 text-gray-400">Tài khoản demo: admin / love123</p>
    </div>
  );
}
