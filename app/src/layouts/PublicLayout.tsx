import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import Alert from '@material-ui/lab/Alert';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import { DialogContextProvider } from 'contexts/dialogContext';
import React from 'react';

const PublicLayout: React.FC = (props) => {
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

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />
      <DialogContextProvider>
        {!isSupportedBrowser() && (
          <Alert severity="error">This is an unsupported browser. Some functionality may not work as expected.</Alert>
        )}

        <Header />

        <Box component="main" flex="1 1 auto">
          {React.Children.map(props.children, (child: any) => {
            return React.cloneElement(child);
          })}
        </Box>

        <Footer />
      </DialogContextProvider>
    </Box>
  );
};

export default PublicLayout;
