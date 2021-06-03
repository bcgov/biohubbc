import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  searchLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  searchContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

/**
 * Layout for all search pages.
 *
 * @param {*} props
 * @return {*}
 */
const SearchLayout: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.searchLayoutRoot}>
      <Box className={classes.searchContainer}>{props.children}</Box>
    </Box>
  );
};

export default SearchLayout;
