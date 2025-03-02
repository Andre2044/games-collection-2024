import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FaviconSwitcher: React.FC = () => {
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
      link.href = '/blackjack-favicon.svg';
      document.title = 'Blackjack - Games Collection';
    } else if (location.pathname === '/settings') {
      link.href = '/settings-favicon.svg';
      document.title = 'Settings - Games Collection';
    } else {
      link.href = '/minesweeper-favicon.svg';
      document.title = 'Minesweeper - Games Collection';
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

export default FaviconSwitcher; 