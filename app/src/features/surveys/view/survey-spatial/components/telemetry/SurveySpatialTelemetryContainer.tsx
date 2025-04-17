import { mdiAccessPointPlus, mdiMapMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { DateRangeSlider } from 'components/sliders/DateRangeSlider';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import dayjs from 'dayjs';
import { SurveySpatialDeploymentTable } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialDeploymentTable';
import { SurveySpatialTelemetryTable } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryTable';
import { useState } from 'react';

export enum SurveySpatialTelemetryContainerViewEnum {
  DEPLOYMENTS = 'DEPLOYMENTS',
  TELEMETRY = 'TELEMETRY'
}

/**
 * Renders the container for the survey spatial telemetry table.
 *
 * @return {*} {JSX.Element}
 */
export const SurveySpatialTelemetryContainer = () => {
  const [activeView, setActiveView] = useState<SurveySpatialTelemetryContainerViewEnum>(
    SurveySpatialTelemetryContainerViewEnum.DEPLOYMENTS
  );

  const views = [
    { label: 'Deployments', value: SurveySpatialTelemetryContainerViewEnum.DEPLOYMENTS, icon: mdiAccessPointPlus },
    { label: 'Telemetry', value: SurveySpatialTelemetryContainerViewEnum.TELEMETRY, icon: mdiMapMarker }
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
      <Box flex="1 1 auto" px={5}>
        <DateRangeSlider
          label="Date Range"
          initialValue={[0, 5]}
          onChange={(value) => {
            // value is [number, number0]
            // TODO
            const startDate = dayjs(value[0]);
            const endDate = dayjs(value[1]);
            dayjs();
          }}
        />
      </Box>
      <Divider />
      <Box flex="1 1 auto" overflow="hidden">
        {activeView === SurveySpatialTelemetryContainerViewEnum.DEPLOYMENTS && <SurveySpatialDeploymentTable />}
        {activeView === SurveySpatialTelemetryContainerViewEnum.TELEMETRY && <SurveySpatialTelemetryTable />}
      </Box>
    </>
  );
};
