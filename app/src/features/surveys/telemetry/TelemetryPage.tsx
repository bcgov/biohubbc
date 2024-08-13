import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect } from 'react';
import SurveyDeploymentsList from './list/SurveyDeploymentList';
import ManualTelemetryTableContainer from './table/TelemetryTableContainer';
import ManualTelemetryHeader from './TelemetryHeader';

const TelemetryPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);

  const deploymentsDataLoader = useDataLoader(biohubApi.survey.getDeploymentsInSurvey);

  useEffect(() => {
    deploymentsDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentsDataLoader, surveyContext.projectId, surveyContext.surveyId]);

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
              deployment_ids={deploymentsDataLoader.data?.map((deployment) => deployment.bctw_deployment_id) ?? []}>
              <ManualTelemetryTableContainer />
            </TelemetryTableContextProvider>
          </Box>
        </Stack>
      </TelemetryDataContextProvider>
    </Stack>
  );
};

export default TelemetryPage;
