import { mdiChartBar, mdiTallyMark5 } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { SurveyObservationAnalytics } from 'features/surveys/view/survey-spatial/components/observation/analytics/SurveyObservationAnalytics';
import { SurveySpatialObservationTable } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservationTable';
import { useState } from 'react';

export enum SurveySpatialObservationContainerViewEnum {
  COUNTS = 'COUNTS',
  ANALYTICS = 'ANALYTICS'
}

export const SurveySpatialObservationContainer = () => {
  const [activeView, setActiveView] = useState<SurveySpatialObservationContainerViewEnum>(
    SurveySpatialObservationContainerViewEnum.COUNTS
  );

  const views = [
    { label: 'Counts', value: SurveySpatialObservationContainerViewEnum.COUNTS, icon: mdiTallyMark5 },
    { label: 'Analytics', value: SurveySpatialObservationContainerViewEnum.ANALYTICS, icon: mdiChartBar }
  ];

  return (
    <>
      <Box flex="0 0 auto" pb={2} px={2}>
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="horizontal"
        />
      </Box>
      <Divider />
      <Box flex="1 1 auto" overflow="hidden">
        {activeView === SurveySpatialObservationContainerViewEnum.COUNTS && <SurveySpatialObservationTable />}
        {activeView === SurveySpatialObservationContainerViewEnum.ANALYTICS && <SurveyObservationAnalytics />}
      </Box>
    </>
  );
};
