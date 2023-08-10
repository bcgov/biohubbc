import { Theme } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import { DialogContextProvider } from 'contexts/dialogContext';
import { PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
          <ErrorBoundary
            onError={(err, info) => {
              console.log('======== ERROR BOUNDARY ========');
              console.log(err);
              console.log('------------');
              console.log(info);
              console.log('------------');
            }}
            fallback={<div>Error Boundary: Something went wrong</div>}>
            {props.children}
          </ErrorBoundary>
        </Box>

        <Footer />
      </DialogContextProvider>
    </Box>
  );
};

export default BaseLayout;
