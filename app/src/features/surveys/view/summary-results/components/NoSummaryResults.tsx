
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const NoSummaryResults = () => {
  return (
    <Paper variant="outlined">
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2} minHeight={66}>
        <Typography
          component="span"
          variant="body2" 
          color="textSecondary" 
          data-testid="summaries-nodata">
            No Summary Results
          </Typography>
      </Box>
    </Paper>
  );
};

export default NoSummaryResults;
