import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Container from '@mui/material/Container';
import Box from '@mui/system/Box';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { SurveyManagePageEnum, SurveyManagePageHeader } from '../components/SurveyManagePageHeader';
import { SURVEY_ACTIVE_TAB_VALUE } from '../view/tabs/SurveyHeaderTabs';
import { AnimalViewToggle } from './sidebar/AnimalViewToggle';
import { SurveyAnimalsTab } from './tabs/SurveyAnimalsTab';
import { SurveyCapturesTab } from './tabs/SurveyCapturesTab';
import { SurveyMarkingsTab } from './tabs/SurveyMarkingsTab';
import { SurveyMeasurementsTab } from './tabs/SurveyMeasurementsTab';
import { SurveyMortalitiesTab } from './tabs/SurveyMortalitiesTab';

export const ANIMAL_ACTIVE_VIEW_KEY = 'a';

export enum ANIMAL_ACTIVE_VIEW_VALUE {
  animals = 'animals',
  captures = 'captures',
  mortalities = 'mortalities',
  markings = 'markings',
  measurements = 'measurements'
}

const DEFAULT_VIEW = ANIMAL_ACTIVE_VIEW_VALUE.animals;

/**
 * Returns the page for managing Animals
 *
 * @return {*}
 */
export const SurveyAnimalPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();
  const history = useHistory();

  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));
  const { searchParams, setSearchParams } = useSearchParams<{ [ANIMAL_ACTIVE_VIEW_KEY]: ANIMAL_ACTIVE_VIEW_VALUE }>();
  const activeView = searchParams.get(ANIMAL_ACTIVE_VIEW_KEY) as ANIMAL_ACTIVE_VIEW_VALUE;

  const [activeTab, setActiveTab] = useState(SURVEY_ACTIVE_TAB_VALUE.details);
  const handleTabChange = (tab: SURVEY_ACTIVE_TAB_VALUE) => setActiveTab(tab);

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.get(ANIMAL_ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ANIMAL_ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyManagePageHeader
        page={SurveyManagePageEnum.ANIMALS}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Container maxWidth="xl" sx={{ my: 3, p: 0, px: 2 }} disableGutters>
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <SidebarLayout
              sidebar={
                <Box p={2}>
                  <Button
                    fullWidth
                    startIcon={<Icon path={mdiArrowLeft} size={1} />}
                    onClick={() => history.push(`/admin/surveys/${surveyContext.surveyId}/details?v=data&dav=animals`)}
                    sx={{
                      py: 1.5,
                      mb: 0.5,
                      color: grey[600],
                      justifyContent: 'flex-start',
                      display: 'flex',
                      fontWeight: 700,
                      px: 2
                    }}>
                    Back
                  </Button>
                  <AnimalViewToggle
                    activeView={activeView}
                    setActiveView={(v) =>
                      setSearchParams(searchParams.set(ANIMAL_ACTIVE_VIEW_KEY, v, { replace: true }))
                    }
                  />
                </Box>
              }>
              <ComponentSwitch
                switch={activeView}
                components={{
                  [ANIMAL_ACTIVE_VIEW_VALUE.animals]: <SurveyAnimalsTab />,
                  [ANIMAL_ACTIVE_VIEW_VALUE.captures]: <SurveyCapturesTab />,
                  [ANIMAL_ACTIVE_VIEW_VALUE.mortalities]: <SurveyMortalitiesTab />,
                  [ANIMAL_ACTIVE_VIEW_VALUE.measurements]: <SurveyMeasurementsTab />,
                  [ANIMAL_ACTIVE_VIEW_VALUE.markings]: <SurveyMarkingsTab />
                }}
              />
            </SidebarLayout>
          </Box>
        </Box>
      </Container>
    </>
  );
};
