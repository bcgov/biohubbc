import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  surveyTypes: string[];
  submissionStatus: Record<string, boolean>;
}

/**
 * ProgressBar Component
 * Displays a progress bar indicating the percentage of completed checklist items.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ surveyTypes, submissionStatus }) => {
  const totalItems = surveyTypes.length;
  const completedItems = surveyTypes.filter((type) => submissionStatus[type]).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
        {`Progress: ${completedItems} of ${totalItems} items completed (${Math.round(progress)}%)`}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
    </Box>
  );
};

export default ProgressBar;
