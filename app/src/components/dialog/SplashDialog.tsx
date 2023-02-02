import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiBellAlertOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  dialogIconContainer: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '128px',
    height: '128px',
    borderRadius: '64px',
    background: 'rgba(9,14,211,0.05)'
  },
  dialogIcon: {
    color: '#0972D3'
  }
}));

export const SplashDialog = () => {
  const classes = useStyles();
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
      <Box className={classes.dialogIconContainer} display="flex" alignItems="center" justifyContent="center">
        <Icon className={classes.dialogIcon} path={mdiBellAlertOutline} size={2}></Icon>
      </Box>
      <DialogTitle id="alert-dialog-title">Important Notice for Data Submissions</DialogTitle>
      <DialogContent id="alert-dialog-description">
        <Typography component="div" color="textSecondary">
          <Box component="p" mt={0}>
            This application will be unavailable from February 6th - 13th, 2023 to support an upcoming release.
          </Box>
          <p>
            Moose data formatted using the Moose Aerial Stratified Random Block Composition Survey 2.5 template,{' '}
            <strong>must be submitted before February 6th, 2023</strong>. This template will not be supported this date.
          </p>
          <p>
            Future submissions must use one of the v2.0 templates provided in the resources section of this application.
            New templates will be available on February 14th, 2023.
          </p>
          <p>
            Questions or comments? Contact us at <a href="mailto:biohub@gov.bc.ca">biohub@gov.bc.ca</a>.
          </p>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button data-testid="ok-button" onClick={() => CloseSplashDialog()} color="primary" variant="contained">
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
