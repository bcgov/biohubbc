import { Box, makeStyles, Theme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  homeLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  homeContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

const HomeLayout = (props: any) => {
  const classes = useStyles();

  return (
    <Box className={classes.homeLayoutRoot}>
      <Box className={classes.homeContainer}>{props.children}</Box>
    </Box>
  );
};

export default HomeLayout;
