import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const SurveyPageOverview = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: '40vh',
        p: 5
      }}>
      <Typography variant="h3" gutterBottom mb={2}>
        Welcome to your Survey!
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        Add data using the checklist tabs on the left.
      </Typography>
      <Typography color="textSecondary">Publish when you're done!</Typography>
    </Box>
  );
};
