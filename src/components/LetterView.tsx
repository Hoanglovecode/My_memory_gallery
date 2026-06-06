import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Letter } from '../types';

interface LetterViewProps {
  letters: Letter[];
}

export default function LetterView({ letters }: LetterViewProps) {
  const hoangLetter = letters.find(l => l.username === 'levanhoang') || {
    title: 'Dear My Love,',
    content: 'Thư Hoàng chưa viết hoặc đang chuẩn bị viết gửi Bạn gái tương lai... ❤️'
  };

  const lanLetter = letters.find(l => l.username === 'bangaituonglai') || {
    title: 'Dear My Love,',
    content: 'Thư Bạn gái tương lai chưa viết hoặc đang chuẩn bị viết gửi Hoàng... ❤️'
  };

  const [activeTab, setActiveTab] = useState<'hoang' | 'bangaituonglai'>('hoang');
  const currentLetter = activeTab === 'hoang' ? hoangLetter : lanLetter;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in flex flex-col items-center justify-center min-h-[75vh]">
      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-white/40 p-1.5 rounded-full border border-[#F2BED1] shadow-sm select-none">
        <button
          onClick={() => setActiveTab('hoang')}
          className={`px-6 py-2.5 rounded-full font-serif font-bold text-sm md:text-base transition-all cursor-pointer ${
            activeTab === 'hoang'
              ? 'bg-theme-dark text-white shadow-md'
              : 'text-theme-dark/70 hover:text-theme-dark hover:bg-white/40'
          }`}
        >
          💌 Thư của Hoàng
        </button>
        <button
          onClick={() => setActiveTab('bangaituonglai')}
          className={`px-6 py-2.5 rounded-full font-serif font-bold text-sm md:text-base transition-all cursor-pointer ${
            activeTab === 'bangaituonglai'
              ? 'bg-theme-dark text-white shadow-md'
              : 'text-theme-dark/70 hover:text-theme-dark hover:bg-white/40'
          }`}
        >
          💌 Thư của Bạn gái tương lai
        </button>
      </div>

      <div className="bg-white p-10 md:p-16 rounded-sm shadow-2xl relative w-full paper-lines min-h-[400px]">
        {/* Decorative rotating heart stamp */}
        <div className="absolute -top-6 -right-6 text-white opacity-90 flex items-center justify-center w-16 h-16 bg-red-500 rounded-full shadow-lg transform rotate-12 select-none">
          <Heart size={32} className="fill-current animate-pulse" />
        </div>

        <h2 className="text-3xl md:text-4xl font-serif font-bold text-theme-dark mb-8 mt-4 leading-tight">
          {currentLetter.title}
        </h2>
        <div className="text-lg md:text-xl font-serif text-gray-700 whitespace-pre-wrap italic leading-relaxed">
          {currentLetter.content}
        </div>
      </div>
    </div>
  );
}
