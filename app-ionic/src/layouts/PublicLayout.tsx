import {
  CssBaseline,
  makeStyles,
  Theme
} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  publicLayoutRoot: {
    height: 'inherit',
    width: 'inherit',
    display: 'flex',
    flexDirection: 'column'
  },
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
    <div className={classes.publicLayoutRoot}>
      <CssBaseline />
      <main className={classes.mainContent}>
        {/* <ErrorBoundary FallbackComponent={ErrorDialog}> */}
        {React.Children.map(props.children, (child: any) => {
          return React.cloneElement(child, { classes: classes });
        })}
        {/* </ErrorBoundary> */}
      </main>
    </div>
  );
};

export default PublicLayout;
