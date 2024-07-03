import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext } from 'react';
import ManualTelemetryHeader from './TelemetryHeader';
import SurveyDeploymentsList from './list/SurveyDeploymentList';
import ManualTelemetryTableContainer from './table/TelemetryTableContainer';

const TelemetryPage = () => {
  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      overflow="hidden"
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <ManualTelemetryHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <TelemetryDataContextProvider>
        <Stack flex="1 1 auto" direction="row" gap={1} p={1}>
          {/* Telematry List */}
          <Box flex="0 0 auto" position="relative" width="400px">
            <SurveyDeploymentsList />
          </Box>
          {/* Telemetry Component */}
          <Box flex="1 1 auto" position="relative">
            <TelemetryTableContextProvider
              deployment_ids={
                surveyContext.deploymentDataLoader.data?.map((deployment) => deployment.deployment_id) ?? []
              }>
              <ManualTelemetryTableContainer />
            </TelemetryTableContextProvider>
          </Box>
        </Stack>
      </TelemetryDataContextProvider>
    </Stack>
  );
};

export default TelemetryPage;
