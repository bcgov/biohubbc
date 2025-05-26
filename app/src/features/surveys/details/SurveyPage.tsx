import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useSearchParams } from 'hooks/useSearchParams';
import { useContext, useEffect } from 'react';
import SurveyHeader from '../view/SurveyHeader';
import SurveyDetailsTab from './tabs/details/SurveyDetailsTab';
import { SurveyPermissionsTab } from './tabs/permissions/SurveyPermissionsTab';

const ACTIVE_TAB_KEY = 't';

export enum SURVEY_ACTIVE_TAB_VALUE {
  details = 'details',
  permissions = 'permissions'
}

const DEFAULT_VIEW = SURVEY_ACTIVE_TAB_VALUE.details;

/**
 * Displays information about a specific survey
 *
 * @returns {*}
 */
export const SurveyPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_TAB_KEY]: SURVEY_ACTIVE_TAB_VALUE }>();
  const activeTab = searchParams.get(ACTIVE_TAB_KEY) as SURVEY_ACTIVE_TAB_VALUE;

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.get(ACTIVE_TAB_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_TAB_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleTabChange = (tab: SURVEY_ACTIVE_TAB_VALUE) =>
    setSearchParams(searchParams.set(ACTIVE_TAB_KEY, tab, { replace: true }));

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
