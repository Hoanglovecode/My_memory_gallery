import { Heart } from 'lucide-react';
import type { Letter } from '../types';

interface LetterViewProps {
  letter: Letter;
}

export default function LetterView({ letter }: LetterViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-10 md:p-16 rounded-sm shadow-2xl relative w-full paper-lines">
        {/* Decorative rotating heart stamp */}
        <div className="absolute -top-6 -right-6 text-white opacity-90 flex items-center justify-center w-16 h-16 bg-red-500 rounded-full shadow-lg transform rotate-12 select-none">
          <Heart size={32} className="fill-current" />
        </div>

        <h2 className="text-3xl md:text-4xl font-serif font-bold text-theme-dark mb-8 mt-4 leading-tight">
          {letter.title}
        </h2>
        <div className="text-lg md:text-xl font-serif text-gray-700 whitespace-pre-wrap italic leading-relaxed">
          {letter.content}
        </div>
      </div>
    </div>
  );
}
