import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

export interface INoObservationsCardProps {
  onImport: () => void;
}

const NoObservationsCard: React.FC<INoObservationsCardProps> = (props) => {
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
