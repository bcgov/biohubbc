import { Box, makeStyles, Theme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  projectsLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  projectsContainer: {
    flex: '1',
    overflow: 'auto'
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
