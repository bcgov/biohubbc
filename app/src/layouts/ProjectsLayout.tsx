import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  projectsLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  projectsContainer: {
    flex: '1'
  }
}));

/**
 * Layout for all project pages.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectsLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.projectsLayoutRoot}>
      <Box className={classes.projectsContainer}>{props.children}</Box>
    </Box>
  );
};

export default ProjectsLayout;
