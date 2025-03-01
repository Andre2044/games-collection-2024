import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './styles/main.css';
import './styles/themes.css';
import Minesweeper from './pages/Minesweeper';
import Blackjack from './pages/Blackjack';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import blackjackFavicon from './assets/blackjack-favicon.svg';
import minesweeperFavicon from './assets/minesweeper-favicon.svg';

// Favicon switcher component
const FaviconSwitcher = () => {
  const location = useLocation();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';

    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }

    // Set new favicon based on route
    if (location.pathname === '/blackjack') {
      link.href = blackjackFavicon;
      document.title = 'Blackjack - Game Center';
    } else {
      link.href = minesweeperFavicon;
      document.title = 'Minesweeper - Game Center';
    }

    document.head.appendChild(link);

    // Cleanup
    return () => {
      if (link.parentNode) {
        document.head.removeChild(link);
      }
    };
  }, [location]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <FaviconSwitcher />
        <Sidebar />
        <Routes>
          <Route path="/" element={<Minesweeper />} />
          <Route path="/blackjack" element={<Blackjack />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
