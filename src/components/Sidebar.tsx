import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Gamepad2, 
  Settings, 
  Home,
  Diamond, 
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Animation variants
  const sidebarVariants: Variants = {
    open: { 
      width: '250px',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    closed: { 
      width: '60px',
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      } 
    }
  };

  const itemVariants: Variants = {
    open: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0, 
      x: -20,
      transition: { type: 'spring', stiffness: 500, damping: 28 }
    }
  };

  const buttonVariants: Variants = {
    hover: { scale: 1.1, rotate: 0 },
    initial: { scale: 1, rotate: 0 },
    closedHover: { scale: 1.1 },
    openHover: { scale: 1.1, rotate: -180 }
  };

  const sparkleVariants: Variants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      scale: [0.8, 1.2, 0.8],
      rotate: [0, 15, 0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  }

  const activeLink = "bg-blue-900/30 text-blue-300 border-l-4 border-blue-400 pl-3";
  const normalLink = "text-slate-300 hover:bg-slate-800/50 hover:text-blue-200 pl-4";

  return (
    <motion.div 
      className="fixed left-0 top-0 h-full z-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-slate-700/50"
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
    >
      {/* Toggle Button */}
      <motion.button
        className="absolute -right-3 top-12 flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-slate-800 shadow-lg"
        onClick={toggleSidebar}
        variants={buttonVariants}
        initial="initial"
        whileHover={isOpen ? "openHover" : "closedHover"}
        aria-label="Toggle Sidebar"
      >
        <motion.div
          animate={{ rotate: isOpen ? -180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ChevronRight size={16} />
        </motion.div>
      </motion.button>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Sidebar Header */}
        <div className="py-6 px-4 flex items-center justify-center">
          <motion.div 
            className="flex items-center justify-center"
            variants={itemVariants}
          >
            <motion.div
              variants={sparkleVariants}
              animate="animate"
              className="mr-2"
            >
              <Sparkles className="text-blue-400" size={20} />
            </motion.div>
            
            {isOpen && (
              <motion.h1 
                className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Games Collection
              </motion.h1>
            )}
          </motion.div>
        </div>

        {/* Sidebar Content */}
        <nav className="flex flex-col flex-grow space-y-1 px-2 py-4">
          <AnimatePresence>
            {/* Home Link */}
            <motion.div 
              key="home-link"
              variants={itemVariants}
              className="overflow-hidden"
            >
              <NavLink 
                to="/" 
                className={`flex items-center p-2 rounded-lg transition-all duration-200 ${location.pathname === '/' ? activeLink : normalLink}`}
              >
                <Home size={20} className="flex-shrink-0" />
                {isOpen && (
                  <motion.span 
                    className="ml-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Home
                  </motion.span>
                )}
              </NavLink>
            </motion.div>

            {/* Minesweeper Link */}
            <motion.div 
              key="minesweeper-link"
              variants={itemVariants}
              className="overflow-hidden"
            >
              <NavLink 
                to="/minesweeper" 
                className={`flex items-center p-2 rounded-lg transition-all duration-200 ${location.pathname === '/minesweeper' ? activeLink : normalLink}`}
              >
                <Diamond size={20} className="flex-shrink-0" />
                {isOpen && (
                  <motion.span 
                    className="ml-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Minesweeper
                  </motion.span>
                )}
              </NavLink>
            </motion.div>

            {/* Blackjack Link */}
            <motion.div 
              key="blackjack-link"
              variants={itemVariants}
              className="overflow-hidden"
            >
              <NavLink 
                to="/blackjack" 
                className={`flex items-center p-2 rounded-lg transition-all duration-200 ${location.pathname === '/blackjack' ? activeLink : normalLink}`}
              >
                <Gamepad2 size={20} className="flex-shrink-0" />
                {isOpen && (
                  <motion.span 
                    className="ml-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Blackjack
                  </motion.span>
                )}
              </NavLink>
            </motion.div>
          </AnimatePresence>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-2 py-4 border-t border-slate-700/30">
          <motion.div 
            variants={itemVariants}
            className="overflow-hidden"
          >
            <NavLink 
              to="/settings" 
              className={`flex items-center p-2 rounded-lg transition-all duration-200 ${location.pathname === '/settings' ? activeLink : normalLink}`}
            >
              <Settings size={20} className="flex-shrink-0" />
              {isOpen && (
                <motion.span 
                  className="ml-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Settings
                </motion.span>
              )}
            </NavLink>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
