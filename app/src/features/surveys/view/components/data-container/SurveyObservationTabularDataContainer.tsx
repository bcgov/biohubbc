import { mdiChartBar, mdiTallyMark5 } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';
import { SurveySpatialObservationTable } from '../../survey-spatial/components/observation/SurveySpatialObservationTable';
import { SurveyObservationAnalytics } from '../analytics/SurveyObservationAnalytics';

export enum SurveyObservationTabularDataContainerViewEnum {
  COUNTS = 'COUNTS',
  ANALYTICS = 'ANALYTICS'
}

interface ISurveyObservationTabularDataContainerProps {
  isLoading: boolean;
}

const SurveyObservationTabularDataContainer = (props: ISurveyObservationTabularDataContainerProps) => {
  const { isLoading } = props;

  const [activeDataView, setActiveDataView] = useState<SurveyObservationTabularDataContainerViewEnum>(
    SurveyObservationTabularDataContainerViewEnum.COUNTS
  );

  const views = [
    { label: 'Counts', value: SurveyObservationTabularDataContainerViewEnum.COUNTS, icon: mdiTallyMark5 },
    { label: 'Analytics', value: SurveyObservationTabularDataContainerViewEnum.ANALYTICS, icon: mdiChartBar }
  ];

  return (
    <>
      <Box flex="0 0 auto" pb={2}>
        <ToggleButtonGroup
          value={activeDataView}
          onChange={(_, view) => {
            if (!view) {
              // An active view must be selected at all times
              return;
            }

            setActiveDataView(view);
          }}
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
            <ToggleButton
              key={view.value}
              component={Button}
              color="primary"
              startIcon={<Icon path={view.icon} size={0.75} />}
              value={view.value}>
              {view.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Divider />
      <Box flex="1 1 auto" overflow="hidden" mt={1}>
        {activeDataView === SurveyObservationTabularDataContainerViewEnum.COUNTS && (
          <SurveySpatialObservationTable isLoading={isLoading} />
        )}
        {activeDataView === SurveyObservationTabularDataContainerViewEnum.ANALYTICS && <SurveyObservationAnalytics />}
      </Box>
    </>
  );
};

export default SurveyObservationTabularDataContainer;
