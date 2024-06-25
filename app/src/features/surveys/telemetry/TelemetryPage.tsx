import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { useContext, useMemo } from 'react';
import ManualTelemetryHeader from './TelemetryHeader';
import ManualTelemetryList from './list/TelemetryList';
import ManualTelemetryTableContainer from './table/TelemetryTableContainer';

const TelemetryPage = () => {
  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);

  const deploymentIds = useMemo(() => {
    return surveyContext.deploymentDataLoader.data?.map((item) => item.deployment_id);
  }, [surveyContext.deploymentDataLoader.data]);

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
    </Stack>
  );
};

export default TelemetryPage;
