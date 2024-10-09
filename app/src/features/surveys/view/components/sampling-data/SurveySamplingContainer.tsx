import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { SurveySamplingHeader } from './components/SurveySamplingHeader';
import { SurveySamplingTabs } from './table/SurveySamplingTabs';

export const SurveySamplingContainer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <SurveySamplingHeader />

      <Divider />

      <SurveySamplingTabs />
    </Box>
  );
};
