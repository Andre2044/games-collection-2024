import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gamepad2, Sun, Moon, Sparkles, ChevronRight } from 'lucide-react';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [animation, setAnimation] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.body.classList.toggle('dark-theme', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    // Trigger animation effect when sidebar opens
    if (isOpen) {
      setAnimation(true);
    }
  }, [isOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full shadow-2xl transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'w-72' : 'w-0'
        } overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="p-6 pt-20 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Gamepad2 className="text-indigo-600 dark:text-indigo-400" size={28} />
                <Sparkles className="text-yellow-500 absolute -top-2 -right-2" size={14} />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Games Collection
              </h2>
            </div>
          </div>
          
          <nav className="flex-grow">
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl relative">
                    🎮
                    {location.pathname === '/' && 
                      <span className="absolute -right-1 -top-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    }
                  </span>
                  <span className="font-medium">Minesweeper</span>
                  <ChevronRight 
                    size={16} 
                    className={`ml-auto transform transition-transform duration-200 ${location.pathname === '/' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} 
                  />
                </Link>
              </li>
              <li 
                className={`transform transition-all duration-500 ${animation ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                style={{ transitionDelay: '100ms' }}
              >
                <Link
                  to="/blackjack"
                  className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 ${
                    location.pathname === '/blackjack'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl relative">
                    🎲
                    {location.pathname === '/blackjack' && 
                      <span className="absolute -right-1 -top-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    }
                  </span>
                  <span className="font-medium">Blackjack</span>
                  <ChevronRight 
                    size={16} 
                    className={`ml-auto transform transition-transform duration-200 ${location.pathname === '/blackjack' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} 
                  />
                </Link>
              </li>
            </ul>
            
            <div className="mt-8 mb-4">
              <div className="bg-gray-100 dark:bg-gray-700/50 h-[1px] w-full"></div>
              <div className="py-2.5 px-4 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                Coming Soon
              </div>
              <ul className="space-y-1 opacity-60">
                <li className="p-3.5 rounded-xl text-gray-500 dark:text-gray-400 flex items-center gap-3">
                  <span className="text-xl">♠️</span>
                  <span className="font-medium">Poker</span>
                </li>
                <li className="p-3.5 rounded-xl text-gray-500 dark:text-gray-400 flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">Darts</span>
                </li>
              </ul>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600">
                  {theme === 'light' ? (
                    <Moon size={18} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Sun size={18} className="text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="relative">
                <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${theme === 'light' ? 'bg-gray-300' : 'bg-indigo-500'}`}></div>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'light' ? '' : 'translate-x-5'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/60 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
