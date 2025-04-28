import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { TelemetryTableContext, TelemetryTableContextProvider } from 'contexts/telemetryTableContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { TelemetryTableContainer } from 'features/surveys/telemetry/table/TelemetryTableContainer';
import { useSurveyContext } from 'hooks/useContext';
import { SurveyManagePageEnum, SurveyManagePageHeader } from '../components/SurveyManagePageHeader';

export const TelemetryPage = () => {
  const surveyContext = useSurveyContext();

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
      <SurveyManagePageHeader
        page={SurveyManagePageEnum.TELEMETRY}
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
          <TelemetryTableContextProvider>
            <TelemetryTableContext.Consumer>
              {(context) => {
                if (!context?._muiDataGridApiRef.current) {
                  // Delay rendering the ObservationsTable until the DataGrid API is available
                  return <CircularProgress className="pageProgress" size={40} />;
                }

                return <TelemetryTableContainer />;
              }}
            </TelemetryTableContext.Consumer>
          </TelemetryTableContextProvider>
        </Box>
      </Stack>
    </Stack>
  );
};
