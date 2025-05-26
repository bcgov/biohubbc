import { green, grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { CodesContext } from 'contexts/codesContext';
import SurveyAttachments from 'features/surveys/view/SurveyAttachments';
import { useSearchParams } from 'hooks/useSearchParams';
import { IGetSurveyChecklist } from 'interfaces/useChecklistApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useContext, useEffect } from 'react';
import { LinearProgressWithLabel } from './checklist/progress/SurveyChecklistProgressBar';
import { SurveyChecklistManager } from './checklist/SurveyChecklistManager';
import { SurveyDataPage } from './data/SurveyDataPage';
import { SurveyOverviewPage } from './overview/SurveyOverviewPage';
import { SurveySamplingPage } from './sampling/SurveySamplingPage';
import { SurveyViewToggle } from './sidebar/SurveyViewToggle';

const SURVEY_ACTIVE_VIEW_KEY = 'v';

export enum SURVEY_ACTIVE_VIEW_VALUE {
  overview = 'overview',
  sampling = 'sampling',
  data = 'data',
  attachments = 'attachments'
}

const DEFAULT_VIEW = SURVEY_ACTIVE_VIEW_VALUE.overview;

interface SurveyDetailsTabProps {
  checklist: IGetSurveyChecklist;
}

/**
 * Displays data and contents of a specific survey, as a tab on the survey page
 *
 * @returns {*}
 */
export const SurveyDetailsTab = ({ checklist }: SurveyDetailsTabProps) => {
  const codesContext = useContext(CodesContext);

  const { searchParams, setSearchParams } = useSearchParams<{ [SURVEY_ACTIVE_VIEW_KEY]: SURVEY_ACTIVE_VIEW_VALUE }>();
  const activeView = searchParams.get(SURVEY_ACTIVE_VIEW_KEY) as SURVEY_ACTIVE_VIEW_VALUE;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.get(SURVEY_ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(SURVEY_ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  const setActiveView = (view: SURVEY_ACTIVE_VIEW_VALUE) =>
    setSearchParams(searchParams.set(SURVEY_ACTIVE_VIEW_KEY, view));

  return (
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
                  <SurveyViewToggle checklist={checklist} activeView={activeView} setActiveView={setActiveView} />
                </Box>
              }>
              <ComponentSwitch
                switch={activeView}
                components={{
                  [SURVEY_ACTIVE_VIEW_VALUE.overview]: <SurveyOverviewPage />,
                  [SURVEY_ACTIVE_VIEW_VALUE.sampling]: <SurveySamplingPage checklistItems={flattenedChecklistItems} />,
                  [SURVEY_ACTIVE_VIEW_VALUE.data]: <SurveyDataPage checklistItems={flattenedChecklistItems} />,
                  [SURVEY_ACTIVE_VIEW_VALUE.attachments]: <SurveyAttachments />
                }}
              />
            </SidebarLayout>
          )}
        </SurveyChecklistManager>
      </Box>
    </Box>
  );
};

export default SurveyDetailsTab;
