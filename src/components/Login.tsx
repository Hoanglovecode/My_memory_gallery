import { useState } from 'react';
import type { View } from '../types';
import { API_BASE_URL } from '../config';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  setIsAdmin: (isAdmin: boolean) => void;
  navigate: (view: View) => void;
}

export default function Login({ setIsAdmin, navigate }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Sai tài khoản hoặc mật khẩu!');
      }

      // Save token to localStorage
      localStorage.setItem('admin_token', data.token);
      setIsAdmin(true);
      navigate('admin');
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:border-theme-dark focus:ring-2 focus:ring-theme-accent1 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer flex items-center justify-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-theme-dark text-white p-4 rounded-xl font-bold text-lg hover:bg-[#8A5B66] shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
        </button>
      </form>
      <p className="text-sm text-center mt-6 text-gray-400">Thông tin đăng nhập: Tên của bạn viết thường và viết liền / Ngày tháng năm sinh viết thường và viết liền</p>
    </div>
  );
}
