import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  surveysLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  surveysContainer: {
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
const SurveysLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.surveysLayoutRoot}>
      <Box className={classes.surveysContainer}>{props.children}</Box>
    </Box>
  );
};

export default SurveysLayout;
