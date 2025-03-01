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

// Show notification with fade
export const showNotification = (message: string, type: 'error' | 'success' = 'error'): void => {
  // Remove any existing notification
  const existingNotification = document.querySelector('.game-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `game-notification ${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'alert');
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.classList.add('visible');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};