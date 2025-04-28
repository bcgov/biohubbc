import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { SamplingSiteManageHeader } from 'features/surveys/sampling-information/manage/SamplingSiteManageHeader';
import { SamplingTechniqueContainer } from 'features/surveys/sampling-information/techniques/SamplingTechniqueContainer';
import { useSurveyContext } from 'hooks/useContext';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { SamplingPeriodContainer } from '../periods/SamplingPeriodContainer';
import { SamplingSiteContainer } from '../sites/SamplingSiteTableContainer';

/**
 * Page for managing sampling information (sampling techniques and sites).
 *
 * @return {*}
 */
export const SamplingSiteManagePage = () => {
  const surveyContext = useSurveyContext();

  return (
    <Stack>
      <SamplingSiteManageHeader
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ?? ''}
      />

      <Container maxWidth={'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SAMPLING]} />
        <Paper sx={{ mb: 3 }}>
          <SamplingTechniqueContainer />
        </Paper>
        <Paper sx={{ mb: 3 }}>
          <SamplingSiteContainer />
        </Paper>
        <Paper>
          <SamplingPeriodContainer />
        </Paper>
      </Container>
    </Stack>
  );
};
