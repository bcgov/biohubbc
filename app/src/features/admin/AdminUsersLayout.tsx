import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  adminUsersLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  adminUsersContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

/**
 * Layout for all admin/users pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.adminUsersLayoutRoot}>
      <Box className={classes.adminUsersContainer}>{props.children}</Box>
    </Box>
  );
};

export default AdminUsersLayout;
