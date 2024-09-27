import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { TelemetryTableContainer } from 'features/surveys/telemetry/table/TelemetryTableContainer';
import { TelemetryHeader } from 'features/surveys/telemetry/TelemetryHeader';
import { useProjectContext, useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { useEffect } from 'react';

export const TelemetryPage = () => {
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  const telemetryDataContext = useTelemetryDataContext();

  const deploymentsDataLoader = telemetryDataContext.deploymentsDataLoader;

  useEffect(() => {
    deploymentsDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentsDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const deploymentIds =
    deploymentsDataLoader.data?.deployments.map((deployment) => deployment.bctw_deployment_id) ?? [];

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
      <TelemetryHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Stack flex="1 1 auto" direction="row" gap={1} p={1}>
        {/* Telematry List */}
        <Box flex="0 0 auto" position="relative" width="400px">
          <SurveyDeploymentList />
        </Box>
        {/* Telemetry Component */}
        <Box flex="1 1 auto" position="relative">
          <TelemetryTableContextProvider deployment_ids={deploymentIds}>
            <TelemetryTableContainer />
          </TelemetryTableContextProvider>
        </Box>
      </Stack>
    </Stack>
  );
};
