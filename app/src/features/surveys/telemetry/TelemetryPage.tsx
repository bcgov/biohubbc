import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { TelemetryTableContainer } from 'features/surveys/telemetry/table/TelemetryTableContainer';
import { TelemetryHeader } from 'features/surveys/telemetry/TelemetryHeader';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

export const TelemetryPage = () => {
  const biohubApi = useBiohubApi();

  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const deploymentDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(projectId, surveyId)
  );

  const telemetryDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.telemetry.getTelemetryForSurvey(projectId, surveyId)
  );

  /**
   * Load the deployments and telemetry data when the page is initially loaded.
   */
  useEffect(() => {
    deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    telemetryDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentDataLoader, telemetryDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  /**
   * Refresh the data for the telemetry page.
   */
  const refreshData = async () => {
    deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    telemetryDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  };

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
      <TelemetryHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Stack flex="1 1 auto" direction="row" gap={1} p={1}>
        {/* Telematry List */}
        <Box flex="0 0 auto" position="relative" width="400px">
          <SurveyDeploymentList
            deployments={deploymentDataLoader.data?.deployments ?? []}
            isLoading={deploymentDataLoader.isLoading}
            refreshRecords={() => {
              refreshData();
            }}
          />
        </Box>
        {/* Telemetry Component */}
        <Box flex="1 1 auto" position="relative">
          <TelemetryTableContextProvider
            isLoading={telemetryDataLoader.isLoading}
            telemetryData={telemetryDataLoader.data?.telemetry ?? []}
            refreshRecords={async () => {
              refreshData();
            }}>
            <TelemetryTableContainer />
          </TelemetryTableContextProvider>
        </Box>
      </Stack>
    </Stack>
  );
};
