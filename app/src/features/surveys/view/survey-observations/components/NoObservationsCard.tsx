import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

const NoObservationsCard: React.FC = () => {
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.importFile}>
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2}>
        <span data-testid="observations-nodata">No Observation Data</span>
      </Box>
    </Paper>
  );
};

export default NoObservationsCard;
