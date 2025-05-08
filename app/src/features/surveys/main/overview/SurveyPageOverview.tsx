import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const SurveyPageOverview = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: '40vh',
        p: 5
      }}>
      <Typography variant="h3" gutterBottom mb={2}>
        Your Survey is empty!
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        Add data using the checklist tabs on the left.
      </Typography>
      <Typography color="textSecondary">Publish when you're done!</Typography>
    </Box>
  );
};
