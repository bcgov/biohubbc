import { Box, CssBaseline, makeStyles, Theme } from '@material-ui/core';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  mainContent: {
    flex: 1,
    width: 'inherit',
    height: 'inherit',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  }
}));

const PublicLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box mb={2} height="inherit" width="inherit" display="flex" flexDirection="column">
      <CssBaseline />

      <Header />

      <main className={classes.mainContent}>
        {React.Children.map(props.children, (child: any) => {
          return React.cloneElement(child, { classes: classes });
        })}
      </main>

      <Footer />

    </Box>
  );
};

export default PublicLayout;
