import { Box, CssBaseline, makeStyles, Theme } from '@material-ui/core';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  mainContent: {}
}));

const PublicLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />

      <Header />

      <Box component="main" flex="1 1 auto">
        {React.Children.map(props.children, (child: any) => {
          return React.cloneElement(child, { classes: classes });
        })}
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicLayout;
