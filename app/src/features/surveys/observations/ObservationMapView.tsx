import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const ObservationMapView = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1 1 auto"
      sx={{
        backgroundColor: 'grey.100'
      }}>
      <Typography variant="body2">Map View</Typography>
    </Box>
  );
};
