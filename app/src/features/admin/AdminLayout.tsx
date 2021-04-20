import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  adminLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  adminContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

/**
 * Layout for all admin pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.adminLayoutRoot}>
      <Box className={classes.adminContainer}>{props.children}</Box>
    </Box>
  );
};

export default AdminLayout;
