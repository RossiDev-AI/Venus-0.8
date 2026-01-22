
import React from 'react';

interface NavItemProps {
  id: any;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon, badge, activeTab, setActiveTab, isMobile }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`relative flex flex-col items-center justify-center md:flex-row gap-1 md:gap-3 px-1 md:px-5 py-2 rounded-xl md:rounded-full transition-all duration-500 group
        ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-indigo-600/10 md:bg-indigo-600 rounded-xl md:rounded-full blur-[4px] md:blur-none opacity-80 md:opacity-100 animate-in fade-in zoom-in-95" />
      )}
      <div className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-2 z-10 ${isActive && !isMobile && 'md:bg-indigo-600'}`}>
         <span className={`text-lg md:text-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-indigo-400'}`}>
          {icon}
         </span>
         <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden max-w-[45px] md:max-w-none text-center">
           {label}
         </span>
         {badge !== undefined && badge > 0 && (
           <span className="absolute -top-1 -right-1 md:static md:ml-1 px-1 min-w-[12px] h-[12px] bg-indigo-500 text-white text-[6px] md:text-[8px] font-black rounded-full flex items-center justify-center">
             {badge > 99 ? '99+' : badge}
           </span>
         )}
      </div>
    </button>
  );
};

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  vaultCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, vaultCount }) => {
  const NAVIGATION_ITEMS = [
    { id: 'creation', label: 'Criar', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg> },
    { id: 'workspace', label: 'Estúdio', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth={2.5}/></svg> },
    { id: 'grading', label: 'Cores', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" strokeWidth={2.5}/></svg> },
    { id: 'cinema', label: 'Cinema', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth={2.5}/></svg> },
    { id: 'fusion', label: 'Fusion', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth={2.5}/></svg> },
    { id: 'manual', label: 'Index', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeWidth={2.5}/></svg> },
    { id: 'vault', label: 'Vault', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth={2.5}/></svg>, badge: vaultCount },
    { id: 'docs', label: 'Docs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={2.5}/></svg> },
    { id: 'settings', label: 'Config', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth={2.5}/><circle cx="12" cy="12" r="3" strokeWidth={2.5}/></svg> }
  ];

  return (
    <>
      {/* Desktop Navigation Dock */}
      <nav className="hidden lg:flex items-center absolute top-[14px] left-1/2 -translate-x-1/2 z-[600] bg-zinc-900/60 backdrop-blur-3xl border border-white/10 p-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-90 xl:scale-100 origin-center">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </nav>

      {/* Mobile All-Visible Floating Dock */}
      <nav className="lg:hidden fixed bottom-4 left-2 right-2 z-[500] bg-black/85 backdrop-blur-3xl border border-white/10 h-20 rounded-[2.5rem] flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none rounded-[2.5rem]" />
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} isMobile />
        ))}
      </nav>
    </>
  );
};

export default Navigation;
