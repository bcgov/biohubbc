import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import SurveyHeader from '../view/SurveyHeader';
import { SurveyDetailsTab } from './tabs/details/SurveyDetailsTab';

/**
 * Displays information about a specific survey
 *
 * @returns {*}
 */
export const SurveyPage = () => {
  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />

      <Container maxWidth="xl" sx={{ my: 3, p: 0, px: 2 }} disableGutters>
        <SurveyDetailsTab checklist={checklist} />
      </Container>
    </>
  );
};
