import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  resourcesLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  resourcesContainer: {
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
const ResourcesLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.resourcesLayoutRoot}>
      <Box className={classes.resourcesContainer}>{props.children}</Box>
    </Box>
  );
};

export default ResourcesLayout;
