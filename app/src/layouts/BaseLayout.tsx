import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import { DialogContextProvider } from 'contexts/dialogContext';
import React, { PropsWithChildren } from 'react';

interface IBaseLayoutProps {
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  alert: {
    borderRadius: 0
  },
  globalAlert: {
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19'
  }
}));

const BaseLayout = (props: PropsWithChildren<IBaseLayoutProps>) => {
  function isSupportedBrowser() {
    if (
      navigator.userAgent.indexOf('Chrome') !== -1 ||
      navigator.userAgent.indexOf('Firefox') !== -1 ||
      navigator.userAgent.indexOf('Safari') !== -1 ||
      navigator.userAgent.indexOf('Edge') !== -1
    ) {
      return true;
    }

    return false;
  }

  const classes = useStyles();

  return (
    <Box className={clsx(classes.baseLayoutContainer, props.className)}>
      <CssBaseline />
      <DialogContextProvider>
        {!isSupportedBrowser() && (
          <Alert severity="error" className={classes.alert}>
            This is an unsupported browser. Some functionality may not work as expected.
          </Alert>
        )}

        <Header />

        <Box component="main" flex="1 1 auto">
          {props.children}
        </Box>

        <Footer />
      </DialogContextProvider>
    </Box>
  );
};

export default BaseLayout;
