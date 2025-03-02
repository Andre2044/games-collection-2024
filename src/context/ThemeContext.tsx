import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ThemeContext now only needs to maintain the dark theme
interface ThemeContextType {
  isDarkMode: boolean; // Always true, kept for compatibility
  toggleTheme: () => void; // No-op function, kept for compatibility
}

const defaultThemeContext: ThemeContextType = {
  isDarkMode: true,
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Apply dark mode to document on mount
  useEffect(() => {
    // Always set dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0f172a'); // Dark blue color
    }
    
    // Force dark mode
    setIsDarkMode(true);
  }, []);

  // This is now a no-op function but kept for API compatibility
  const toggleTheme = () => {
    // Do nothing - we're enforcing dark mode only
    console.log('Dark mode is enforced in this application');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 