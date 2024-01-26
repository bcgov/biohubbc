import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext, useMemo } from 'react';
import ManualTelemetryHeader from './ManualTelemetryHeader';
import ManualTelemetryList from './ManualTelemetryList';
import ManualTelemetryTableContainer from './telemetry-table/ManualTelemetryTableContainer';

const ManualTelemetryPage = () => {
  const surveyContext = useContext(SurveyContext);
  const deploymentIds = useMemo(() => {
    return surveyContext.deploymentDataLoader.data?.map((item) => item.deployment_id);
  }, [surveyContext.deploymentDataLoader.data]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <ManualTelemetryHeader
        project_id={surveyContext.projectId}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />

      <TelemetryDataContextProvider>
        <Stack flex="1 1 auto" direction="row" gap={1} p={1}>
          {/* Telematry List */}
          <Box flex="0 0 auto" position="relative" width="400px">
            <ManualTelemetryList />
          </Box>
          {/* Telemetry Component */}
          <Box flex="1 1 auto" position="relative">
            <TelemetryTableContextProvider deployment_ids={deploymentIds ?? []}>
              <ManualTelemetryTableContainer />
            </TelemetryTableContextProvider>
          </Box>
        </Stack>
      </TelemetryDataContextProvider>
    </Box>
  );
};

export default ManualTelemetryPage;
