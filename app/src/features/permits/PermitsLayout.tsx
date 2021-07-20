import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  permitsLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  permitsContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

/**
 * Layout for all permit pages.
 *
 * @param {*} props
 * @return {*}
 */
const PermitsLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.permitsLayoutRoot}>
      <Box className={classes.permitsContainer}>{props.children}</Box>
    </Box>
  );
};

export default PermitsLayout;
