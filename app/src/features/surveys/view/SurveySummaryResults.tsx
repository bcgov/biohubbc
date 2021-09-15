import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const SurveySummaryResults = () => {
  return (
    <Box>
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography data-testid="summary-results-heading" variant="h2">
          Summary results
        </Typography>
      </Box>
      <Box component={Paper} p={4}></Box>
    </Box>
  );
};

export default SurveySummaryResults;
