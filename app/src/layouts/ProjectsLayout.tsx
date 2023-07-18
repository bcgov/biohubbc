import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
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
const ProjectsLayout: React.FC<React.PropsWithChildren> = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.projectsLayoutRoot}>
      <Box className={classes.projectsContainer}>{props.children}</Box>
    </Box>
  );
};

export default ProjectsLayout;
