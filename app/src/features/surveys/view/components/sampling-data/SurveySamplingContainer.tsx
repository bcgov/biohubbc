import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { SurveySamplingTabs } from 'features/surveys/view/components/sampling-data/components/SurveySamplingTabs';
import { SurveySamplingHeader } from './components/SurveySamplingHeader';

export const SurveySamplingContainer = () => {
  return (
    <Paper>
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
    </Paper>
  );
};
