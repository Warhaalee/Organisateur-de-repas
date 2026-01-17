
import React from 'react';
import { Box, BookOpen, Calendar, ShoppingCart, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Box, label: 'Stock' },
    { path: '/recipes', icon: BookOpen, label: 'Recettes' },
    { path: '/planning', icon: Calendar, label: 'Menu' },
    { path: '/shopping', icon: ShoppingCart, label: 'Courses' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around p-4 z-50 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path) ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex-col p-8 gap-8 z-50 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <ShoppingCart size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-800">MiamPlanner</h1>
        </div>
        
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                isActive(item.path)
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon size={22} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t border-gray-50">
          <button 
             onClick={() => (window as any).aistudio.openSelectKey()}
             className="flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:text-gray-600 transition-all w-full text-left"
          >
            <Settings size={22} />
            <span className="font-bold">Paramètres Clé</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
