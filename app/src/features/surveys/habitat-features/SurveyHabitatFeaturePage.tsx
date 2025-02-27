import { Box, CircularProgress, Stack } from '@mui/material';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { SurveyManagePageEnum, SurveyManagePageHeader } from '../components/SurveyManagePageHeader';
import { SamplingSiteList } from '../observations/sampling-sites/SamplingSiteList';
import { SurveyHabitatFeatureTableContainer } from './components/SurveyHabitatFeatureTableContainer';

/**
 * Returns the page for managing Habitat Features
 *
 * @return {*} {JSX.Element}
 */
export const SurveyHabitatFeaturePage = (): JSX.Element => {
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
      <SurveyManagePageHeader
        page={SurveyManagePageEnum.HABITAT_FEATURES}
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Stack
        direction="row"
        gap={1}
        sx={{
          flex: '1 1 auto',
          p: 1
        }}>
        {/* Sampling Site List */}
        <Box flex="0 0 auto" width="400px">
          <DialogContextProvider>
            {/* TODO: Mac: Update isMenuDisabled with correct value */}
            <SamplingSiteList isMenuDisabled={false} />
          </DialogContextProvider>
        </Box>

        {/* Survey Habitat Feature Table */}
        <Box flex="1 1 auto">
          <SurveyHabitatFeatureTableContainer />
        </Box>
      </Stack>
    </Stack>
  );
};
