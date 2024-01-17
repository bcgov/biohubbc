import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import NoSurveySectionData from '../components/NoSurveySectionData';

const ManualTelemetrySection = () => {
  return (
    <Box>
      <Toolbar>
        <Typography variant="h4" component="h2" sx={{ flex: '1 1 auto' }}>
          Telemetry
        </Typography>
        <Button
          component={RouterLink}
          to={'telemetry'}
          title="Manage telemetry data"
          variant="contained"
          color="primary">
          Manage Telemetry
        </Button>
      </Toolbar>
      <Divider></Divider>
      <Box p={3}>
        <NoSurveySectionData text="No telemetry data available" paperVariant="outlined" />
      </Box>
    </Box>
  );
};

export default ManualTelemetrySection;
