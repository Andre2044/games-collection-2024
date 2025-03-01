import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="copyright">
          © {currentYear} Frieesein
        </div>
        <div className="social-links">
          <a
            href="https://github.com/Andre2044"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="social-link"
          >
            <Github size={20} />
          </a>
          <a
            href="https://tiktok.com/@friessein"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok Profile"
            className="social-link"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
          <a
            href="https://twitter.com/friessein"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter) Profile"
            className="social-link"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768M20 4l-6.768 6.768" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;