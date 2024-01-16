import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext, useMemo } from 'react';
import ManualTelemetryComponent from './ManualTelemetryComponent';
import ManualTelemetryHeader from './ManualTelemetryHeader';
import ManualTelemetryList from './ManualTelemetryList';
import Stack from '@mui/material/Stack';

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
        <Stack
          flex="1 1 auto"
          direction="row"
          gap={1}
          p={1}
          overflow="hidden">
            {/* Manual Telematry List */}
            <Box 
              flex="0 0 auto"
              position="relative" 
              width="400px">
              <ManualTelemetryList />
            </Box>
            {/* Manual Telemetry Component */}
            <Box 
              flex="1 1 auto"
              position="relative"
              overflow="hidden">
              <TelemetryTableContextProvider deployment_ids={deploymentIds ?? []}>
                <ManualTelemetryComponent />
              </TelemetryTableContextProvider>
            </Box>
        </Stack>
      </TelemetryDataContextProvider>
    </Box>
  );
};

export default ManualTelemetryPage;
