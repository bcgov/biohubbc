import { mdiChartBar, mdiTallyMark5 } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useState } from 'react';
import { SurveySpatialObservationTable } from '../../survey-spatial/components/observation/SurveySpatialObservationTable';
import { SurveyObservationAnalytics } from '../analytics/SurveyObservationAnalytics';

export enum SurveyObservationTabularDataContainerViewEnum {
  COUNTS = 'COUNTS',
  ANALYTICS = 'ANALYTICS'
}

const SurveyObservationTabularDataContainer = () => {
  const [activeView, setActiveView] = useState<SurveyObservationTabularDataContainerViewEnum>(
    SurveyObservationTabularDataContainerViewEnum.COUNTS
  );

  const views = [
    { label: 'Counts', value: SurveyObservationTabularDataContainerViewEnum.COUNTS, icon: mdiTallyMark5 },
    { label: 'Analytics', value: SurveyObservationTabularDataContainerViewEnum.ANALYTICS, icon: mdiChartBar }
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
        {activeView === SurveyObservationTabularDataContainerViewEnum.COUNTS && <SurveySpatialObservationTable />}
        {activeView === SurveyObservationTabularDataContainerViewEnum.ANALYTICS && <SurveyObservationAnalytics />}
      </Box>
    </>
  );
};

export default SurveyObservationTabularDataContainer;
