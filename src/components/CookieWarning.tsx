import React, { useState, useEffect } from 'react';

const CookieWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookies-accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="cookie-warning" role="alert">
      <div className="cookie-content">
        <p>
          This website uses cookies to save your game progress and preferences.
          By continuing to use this site, you agree to our use of cookies.
        </p>
        <button onClick={handleAccept} className="cookie-accept">
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieWarning;