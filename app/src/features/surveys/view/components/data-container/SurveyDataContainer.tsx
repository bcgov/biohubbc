import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';
import SurveyObservationAnalytics from '../analytics/SurveyObservationAnalytics';
import SurveySpatialObservationDataTable from '../spatial-data/SurveySpatialObservationDataTable';

export enum SurveyDataContainerViewEnum {
  RAW = 'RAW',
  ANALYTICS = 'ANALYTICS'
}

interface ISurveyDataContainerProps {
  isLoading: boolean;
}

const SurveyDataContainer = (props: ISurveyDataContainerProps) => {
  const { isLoading } = props;

  const [activeDataView, setActiveDataView] = useState<SurveyDataContainerViewEnum>(SurveyDataContainerViewEnum.RAW);

  const views = [
    { label: 'Raw', value: 'RAW' },
    { label: 'Analytics', value: 'ANALYTICS' }
  ];

  console.log(activeDataView);

  return (
    <>
      <Box px={2} pt={2} display="flex" justifyContent="space-between">
        <ToggleButtonGroup
          value={activeDataView}
          onChange={(_, value) => setActiveDataView(value)}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': {
              py: 0.25,
              px: 1.5,
              border: 'none',
              borderRadius: '4px !important',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.02rem'
            }
          }}>
          {views.map((view) => (
            <ToggleButton key={view.value} component={Button} color="primary" value={view.value}>
              {view.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Divider sx={{ mt: 2 }} />
      <Box p={2}>
        {activeDataView === SurveyDataContainerViewEnum.RAW && (
          <SurveySpatialObservationDataTable isLoading={isLoading} />
        )}
        {activeDataView === SurveyDataContainerViewEnum.ANALYTICS && <SurveyObservationAnalytics />}
      </Box>
    </>
  );
};

export default SurveyDataContainer;
