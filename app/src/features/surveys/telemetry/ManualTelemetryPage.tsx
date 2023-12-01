import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext } from 'react';
import SurveyObservationHeader from '../observations/SurveyObservationHeader';
import ManualTelemetryComponent from './ManualTelemetryComponent';
import ManualTelemetryList from './ManualTelemetryList';

const ManualTelemetryPage = () => {
  const surveyContext = useContext(SurveyContext);
  const deploymentIds = surveyContext.deploymentDataLoader.data?.map((item) => item.deployment_id);
  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <SurveyObservationHeader
        project_id={surveyContext.projectId}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          m: 1
        }}>
        <Box
          flex="0 0 auto"
          width="400px"
          sx={{
            borderRight: '1px solid ' + grey[300]
          }}>
          <ManualTelemetryList />
        </Box>
        <Box flex="1 1 auto" overflow="hidden">
          <TelemetryDataContextProvider>
            <TelemetryTableContextProvider deployment_ids={deploymentIds || []}>
              <ManualTelemetryComponent />
            </TelemetryTableContextProvider>
          </TelemetryDataContextProvider>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManualTelemetryPage;
