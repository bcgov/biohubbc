import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { useEffect, useState } from 'react';

export const SplashDialog = () => {
  const [open, setOpen] = useState(window.sessionStorage.getItem('sims_splash_screen') !== 'dontshow');

  useEffect(() => {
    function showSplashScreen() {
      if (window.sessionStorage.getItem('sims_splash_screen') === 'dontshow') {
        setOpen(false);
        return;
      }

      setOpen(true);
    }

    function handleStorageEvent(this: Window) {
      showSplashScreen();
    }

    showSplashScreen();

    window.addEventListener('storage', handleStorageEvent);

    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => window.sessionStorage.setItem('sims_splash_screen', 'dontshow')}
      data-testid="splash-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">MY TITLE</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">TESTSETSETTE</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-testid="ok-button" onClick={() => CloseSplashDialog()} color="primary" variant="outlined">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CloseSplashDialog = () => {
  window.sessionStorage.setItem('sims_splash_screen', 'dontshow');
  window.dispatchEvent(new Event('storage'));
};

export const OpenSplashDialog = () => {
  window.sessionStorage.setItem('sims_splash_screen', '');
  window.dispatchEvent(new Event('storage'));
};
