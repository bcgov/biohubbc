import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

const NoObservationsCard: React.FC = () => {
  return (
    <Paper variant="outlined">
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2} minHeight={66}>
        <Typography component="span" variant="body2" color="textSecondary" data-testid="observations-nodata">
          No Observation Data
        </Typography>
      </Box>
    </Paper>
  );
};

export default NoObservationsCard;
