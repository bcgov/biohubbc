import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useSearchParams } from 'hooks/useSearchParams';
import { useContext } from 'react';
import SurveyHeader from '../view/SurveyHeader';
import { SURVEY_ACTIVE_TAB_KEY, SURVEY_ACTIVE_TAB_VALUE } from '../view/tabs/SurveyHeaderTabs';
import SurveyDetailsTab from './tabs/details/SurveyDetailsTab';
import { SurveyPermissionsTab } from './tabs/permissions/SurveyPermissionsTab';

/**
 * Displays information about a specific survey
 *
 * @returns {*}
 */
export const SurveyPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const { searchParams, setSearchParams } = useSearchParams<{ [SURVEY_ACTIVE_TAB_KEY]: SURVEY_ACTIVE_TAB_VALUE }>();
  const activeTab = searchParams.get(SURVEY_ACTIVE_TAB_KEY) as SURVEY_ACTIVE_TAB_VALUE;

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleTabChange = (tab: SURVEY_ACTIVE_TAB_VALUE) =>
    setSearchParams(searchParams.set(SURVEY_ACTIVE_TAB_KEY, tab, { replace: true }));

  return (
    <>
      <SurveyHeader activeTab={activeTab} handleTabChange={handleTabChange} />

      <Container maxWidth="xl" sx={{ my: 3, p: 0, px: 2 }} disableGutters>
        {activeTab === 'details' && <SurveyDetailsTab checklist={checklist} />}
        {activeTab === 'permissions' && <SurveyPermissionsTab />}
      </Container>
    </>
  );
};
