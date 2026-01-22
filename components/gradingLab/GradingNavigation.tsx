
import React from 'react';

interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface GradingNavigationProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const GradingNavigation: React.FC<GradingNavigationProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="w-full bg-[#08080a] border-b border-white/5 p-4">
       <div className="grid grid-cols-4 gap-2">
         {categories.map((cat) => {
           const isActive = activeCategory === cat.id;
           return (
             <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-200 group border ${isActive ? 'bg-zinc-800 border-indigo-500/50 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
             >
                <span className={`text-lg transition-transform ${isActive ? 'scale-110 text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                  {cat.icon}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>{cat.label}</span>
             </button>
           );
         })}
       </div>
    </div>
  );
};

export default GradingNavigation;
