import { mdiArrowExpand } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useContext, useEffect, useState } from 'react';

import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { CodesContext } from 'contexts/codesContext';
import SurveyAttachments from 'features/surveys/view/SurveyAttachments';
import { useSearchParams } from 'hooks/useSearchParams';
import { IGetSurveyChecklist } from 'interfaces/useChecklistApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { SurveyChecklistManager } from './checklist/SurveyChecklistManager';
import { LinearProgressWithLabel } from './checklist/progress/SurveyChecklistProgressBar';
import { DATA_ACTIVE_VIEW_KEY, SurveyDataPage } from './data/SurveyDataPage';
import { SurveyOverviewPage } from './overview/SurveyOverviewPage';
import { SAMPLING_ACTIVE_VIEW_KEY, SurveySamplingPage } from './sampling/SurveySamplingPage';
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

export const SurveyDetailsTab = ({ checklist }: SurveyDetailsTabProps) => {
  const codesContext = useContext(CodesContext);
  const [showProgress, setShowProgress] = useState(false);
  const [delayedShowContent, setDelayedShowContent] = useState(true);

  const { searchParams, setSearchParams } = useSearchParams<{ [SURVEY_ACTIVE_VIEW_KEY]: SURVEY_ACTIVE_VIEW_VALUE }>();
  const activeView = (searchParams.get(SURVEY_ACTIVE_VIEW_KEY) ?? DEFAULT_VIEW) as SURVEY_ACTIVE_VIEW_VALUE;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.has(SURVEY_ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(SURVEY_ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delay showing content until after transition completes
  useEffect(() => {
    if (!showProgress) {
      const timeout = setTimeout(() => {
        setDelayedShowContent(true);
      }, 300); // match transition duration
      return () => clearTimeout(timeout);
    } else {
      setDelayedShowContent(false);
    }
  }, [showProgress]);

  const handleSetActiveView = (view: SURVEY_ACTIVE_VIEW_VALUE) => {
    setSearchParams(
      searchParams.set(SURVEY_ACTIVE_VIEW_KEY, view, {
        replace: [SAMPLING_ACTIVE_VIEW_KEY, DATA_ACTIVE_VIEW_KEY]
      })
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
        <SurveyChecklistManager checklist={checklist}>
          {(flattenedChecklistItems) => (
            <SidebarLayout
              sx={{ borderRadius: '4px' }}
              sidebar={
                <Box
                  p={2}
                  sx={{
                    width: showProgress ? '50%' : 300,
                    transition: 'width 0.3s ease',
                    overflow: 'hidden'
                  }}>
                  <Paper
                    role="button"
                    tabIndex={0}
                    elevation={0}
                    onClick={() => setShowProgress((prev) => !prev)}
                    sx={{
                      bgcolor: checklist.progress_percentage === 100 ? '#f6faf5' : grey[50],
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.1s linear, background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: checklist.progress_percentage === 100 ? '#eaf3e8' : grey[100]
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${checklist.progress_percentage === 100 ? '#4caf50' : grey[400]}`,
                        outlineOffset: 2
                      }
                    }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography gutterBottom component="legend" sx={{ mb: 0 }}>
                        Progress
                      </Typography>
                      <Icon path={mdiArrowExpand} size={0.8} color={grey[500]} />
                    </Box>
                    <Box mt={1}>
                      <LinearProgressWithLabel value={checklist.progress_percentage} />
                    </Box>
                  </Paper>

                  <SurveyViewToggle checklist={checklist} activeView={activeView} setActiveView={handleSetActiveView} />
                </Box>
              }>
              {delayedShowContent && (
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
              )}
            </SidebarLayout>
          )}
        </SurveyChecklistManager>
      </Box>
    </Box>
  );
};
