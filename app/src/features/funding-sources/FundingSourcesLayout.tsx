import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  fundingSourcesLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  fundingSourcesContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

/**
 * Layout for all admin/funding-sources pages.
 *
 * @param {*} props
 * @return {*}
 */
const FundingSourcesLayout: React.FC<React.PropsWithChildren> = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.fundingSourcesLayoutRoot}>
      <Box className={classes.fundingSourcesContainer}>{props.children}</Box>
    </Box>
  );
};

export default FundingSourcesLayout;
