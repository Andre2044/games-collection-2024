import { toast } from 'react-hot-toast';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Apply reveal animation to a cell
export const animateCellReveal = (element: HTMLElement): void => {
  element.style.transition = 'transform 150ms ease-out, background-color 150ms ease-out';
  element.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 10);
};

// Apply flag toggle animation
export const animateFlagToggle = (element: HTMLElement): void => {
  element.style.transition = 'transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  element.style.transform = 'scale(1.2)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
};

// Apply mine explosion animation
export const animateMineExplosion = (element: HTMLElement): void => {
  element.style.transition = 'transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  element.style.transform = 'scale(1.3)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 150);
};

/**
 * Show a toast notification with custom styling based on type
 */
export const showNotification = (message: string, type: NotificationType = 'info') => {
  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(90deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)',
          color: '#ffffff',
          icon: '🎉'
        };
      case 'error':
        return {
          background: 'linear-gradient(90deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.9) 100%)',
          color: '#ffffff',
          icon: '💥'
        };
      case 'warning':
        return {
          background: 'linear-gradient(90deg, rgba(245,158,11,0.9) 0%, rgba(217,119,6,0.9) 100%)',
          color: '#ffffff',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          background: 'linear-gradient(90deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.9) 100%)',
          color: '#ffffff',
          icon: '💡'
        };
    }
  };
  
  const style = getStyle();
  
  toast(message, {
    style: {
      background: style.background,
      color: style.color,
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: 500,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    icon: style.icon,
    position: 'bottom-center',
    duration: 3000
  });
};

/**
 * Apply a confetti effect for celebrations
 */
export const showConfetti = () => {
  if (typeof window === 'undefined') return;
  
  // We would typically use a confetti library here
  // This is a placeholder for actual confetti implementation
  console.log('Confetti animation would play here');
  
  // For a real implementation, you would:
  // 1. Import a confetti library like canvas-confetti
  // 2. Configure and trigger the animation
};

/**
 * Apply a shake animation to an element
 */
export const applyShakeAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('shake-animation');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('shake-animation');
  }, 820); // 820ms matches our CSS animation duration
};

/**
 * Apply a pulse animation to an element
 */
export const applyPulseAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('pulse-animation');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('pulse-animation');
  }, 1000); // 1000ms matches our CSS animation duration
};

/**
 * Apply a bounce animation to an element
 */
export const applyBounceAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('bounce-animation');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('bounce-animation');
  }, 1000); // 1000ms matches our CSS animation duration
};

/**
 * Apply a fade in animation to an element
 */
export const applyFadeInAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('fade-in-animation');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('fade-in-animation');
  }, 500); // 500ms matches our CSS animation duration
};

/**
 * Apply a float animation to an element
 */
export const applyFloatAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('float-animation');
  
  // This is a continuous animation, so we don't remove the class
};