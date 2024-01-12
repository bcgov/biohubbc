import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext, useMemo } from 'react';
import ManualTelemetryComponent from './ManualTelemetryComponent';
import ManualTelemetryHeader from './ManualTelemetryHeader';
import ManualTelemetryList from './ManualTelemetryList';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

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
        <Paper
          component={Stack}
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{
            flex: '1 1 auto',
            m: 1,
            overflow: 'hidden'
          }}>
            {/* Manual Telematry List */}
            <Box
              flex="0 0 auto"
              width="400px">
              <ManualTelemetryList />
            </Box>
            {/* Manual Telemetry Component */}
            <Box flex="1 1 auto" overflow="hidden">
              <TelemetryTableContextProvider deployment_ids={deploymentIds ?? []}>
                <ManualTelemetryComponent />
              </TelemetryTableContextProvider>
            </Box>
        </Paper>
      </TelemetryDataContextProvider>
    </Box>
  );
};

export default ManualTelemetryPage;
