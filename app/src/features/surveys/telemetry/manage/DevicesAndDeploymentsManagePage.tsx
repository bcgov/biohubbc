import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import { DeploymentsContainer } from 'features/surveys/telemetry/manage/deployments/table/DeploymentsContainer';
import { DevicesContainer } from 'features/surveys/telemetry/manage/devices/table/DevicesContainer';
import { DevicesAndDeploymentsManageHeader } from 'features/surveys/telemetry/manage/DevicesAndDeploymentsManageHeader';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';

/**
 * Page for managing telemetry device and deployment information.
 *
 * @return {*}
 */
export const DevicesAndDeploymentsManagePage = () => {
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  return (
    <Stack>
      <DevicesAndDeploymentsManageHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data?.projectData.project.project_name ?? ''}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ?? ''}
      />

      <Container maxWidth={'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
        <Paper sx={{ mb: 3 }}>
          <DevicesContainer />
        </Paper>
        <Paper>
          <DeploymentsContainer />
        </Paper>
      </Container>
    </Stack>
  );
};
