import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Minesweeper from './pages/Minesweeper';
import Blackjack from './pages/Blackjack';
import Settings from './pages/Settings';
import Footer from './components/Footer';
import FaviconSwitcher from './components/FaviconSwitcher';
import './styles/main.css';

// Main application component
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Force dark mode styling on the root element
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0f172a';
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Slightly longer loading time for a better visual effect
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <ThemeProvider>
      <div className="app-container dark">
        <BrowserRouter>
          <FaviconSwitcher />
          
          {loading ? (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin spinner mx-auto"></div>
                <p className="mt-4 text-gray-200">Loading your games...</p>
              </div>
            </div>
          ) : (
            <>
              <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
              
              <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[250px]' : 'ml-[60px]'}`}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <motion.div
                          className="page-container"
                          key="home"
                          initial="initial"
                          animate="enter"
                          exit="exit"
                          variants={pageVariants}
                        >
                          <Minesweeper />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/minesweeper" 
                      element={
                        <motion.div
                          className="page-container"
                          key="minesweeper"
                          initial="initial"
                          animate="enter"
                          exit="exit"
                          variants={pageVariants}
                        >
                          <Minesweeper />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/blackjack" 
                      element={
                        <motion.div
                          className="page-container"
                          key="blackjack"
                          initial="initial"
                          animate="enter"
                          exit="exit"
                          variants={pageVariants}
                        >
                          <Blackjack />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <motion.div
                          className="page-container"
                          key="settings"
                          initial="initial"
                          animate="enter"
                          exit="exit"
                          variants={pageVariants}
                        >
                          <Settings />
                        </motion.div>
                      } 
                    />
                  </Routes>
                </AnimatePresence>
              </main>
            </>
          )}
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};

export default App;
