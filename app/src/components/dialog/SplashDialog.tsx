import { DialogContext } from 'contexts/dialogContext';
import { useContext, useEffect } from 'react';

export const ShowSplashDialog = () => {
  const dialogContext = useContext(DialogContext);

  useEffect(() => {
    function showSplashScreen() {
      if (window.sessionStorage.getItem('sims_splash_screen') === 'shown') {
        return;
      }

      window.sessionStorage.setItem('sims_splash_screen', 'shown');

      dialogContext.setErrorDialog({
        dialogText: 'text',
        dialogError: 'content',
        open: true,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }

    function handleStorageEvent(this: Window) {
      showSplashScreen();
    }

    showSplashScreen();

    window.addEventListener('storage', handleStorageEvent);

    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);
};

export const ReShowSplashDialog = () => {
  window.sessionStorage.setItem('sims_splash_screen', '');
  window.dispatchEvent(new Event('storage'));
};
