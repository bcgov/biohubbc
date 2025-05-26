import { useContext, useEffect } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';

import { ToggleButtonView } from 'components/toggle/HierarchicalCustomToggleButtonGroup';

import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';

import { useSearchParams } from 'hooks/useSearchParams';

import SurveyHeader from '../view/SurveyHeader';

import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import SurveyAttachments from '../view/SurveyAttachments';
import { LinearProgressWithLabel } from './checklist/progress/SurveyChecklistProgressBar';
import { SurveyChecklistManager } from './checklist/SurveyChecklistManager';
import { DATA_ACTIVE_VIEW_VALUE, SurveyDataPage } from './data/SurveyDataPage';
import { SurveyOverviewPage } from './overview/SurveyOverviewPage';
import { SAMPLING_ACTIVE_VIEW_VALUE, SurveySamplingPage } from './sampling/SurveySamplingPage';
import { SurveyViewToggle } from './sidebar/SurveyViewToggle';

const ACTIVE_VIEW_KEY = 'v';

export enum SURVEY_ACTIVE_VIEW_VALUE {
  overview = 'overview',
  sampling = 'sampling',
  data = 'data',
  attachments = 'attachments'
}

export type ChecklistItem = IGetSurveyChecklistItem &
  ToggleButtonView<SURVEY_ACTIVE_VIEW_VALUE | SAMPLING_ACTIVE_VIEW_VALUE | DATA_ACTIVE_VIEW_VALUE> & {
    children?: ChecklistItem[];
  };

const DEFAULT_VIEW = SURVEY_ACTIVE_VIEW_VALUE.overview;

export const SurveyPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: SURVEY_ACTIVE_VIEW_VALUE }>();
  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as SURVEY_ACTIVE_VIEW_VALUE;

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ my: 3, p: 0, px: 2 }} disableGutters>
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <SurveyChecklistManager checklist={checklist}>
              {(flattenedChecklistItems) => (
                <SidebarLayout
                  sx={{ borderRadius: '4px' }}
                  sidebar={
                    <Box p={2}>
                      <Paper
                        sx={{ bgcolor: checklist.progress_percentage === 100 ? green[50] : grey[50], p: 2, mb: 1 }}
                        elevation={0}>
                        <Typography gutterBottom component="legend">
                          Progress
                        </Typography>
                        <Box mr={1} mb={1}>
                          <LinearProgressWithLabel value={checklist.progress_percentage} />
                        </Box>
                      </Paper>
                      <SurveyViewToggle
                        checklist={checklist}
                        activeView={activeView}
                        setActiveView={(v) => setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, v, { replace: true }))}
                      />
                    </Box>
                  }>
                  <ComponentSwitch
                    switch={activeView}
                    components={{
                      [SURVEY_ACTIVE_VIEW_VALUE.overview]: <SurveyOverviewPage />,
                      [SURVEY_ACTIVE_VIEW_VALUE.sampling]: (
                        <SurveySamplingPage checklistItems={flattenedChecklistItems} />
                      ),
                      [SURVEY_ACTIVE_VIEW_VALUE.data]: <SurveyDataPage checklistItems={flattenedChecklistItems} />,
                      [SURVEY_ACTIVE_VIEW_VALUE.attachments]: <SurveyAttachments />
                    }}
                  />
                </SidebarLayout>
              )}
            </SurveyChecklistManager>
          </Box>
        </Box>
      </Container>
    </>
  );
};
