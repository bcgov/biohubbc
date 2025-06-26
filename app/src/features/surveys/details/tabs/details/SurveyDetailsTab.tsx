import { mdiArrowExpand } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useContext, useEffect, useState } from 'react';

import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import {
  DATA_ACTIVE_VIEW_VALUE,
  SAMPLING_ACTIVE_VIEW_VALUE,
  SURVEY_ACTIVE_VIEW_VALUE,
  SURVEY_VIEW_VALUE
} from 'constants/survey-view';
import { CodesContext } from 'contexts/codesContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { DevicesContainer } from 'features/surveys/telemetry/manage/devices/table/DevicesContainer';
import { SurveySpatialTelemetry } from 'features/surveys/telemetry/SurveySpatialTelemetry';
import { useSearchParams } from 'hooks/useSearchParams';
import { IGetSurveyChecklist } from 'interfaces/useChecklistApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import SurveyMembersContainer from '../permissions/members/SurveyMembersContainer';
import { LinearProgressWithLabel } from './checklist/progress/SurveyChecklistProgressBar';
import { SurveyChecklistManager } from './checklist/SurveyChecklistManager';
import { SurveySpatialAnimals } from './data/animals/SurveySpatialAnimals';
import { SurveySpatialHabitatFeatures } from './data/habitat/SurveySpatialHabitatFeatures';
import { SurveySpatialObservations } from './data/observations/SurveySpatialObservations';
import { DATA_ACTIVE_VIEW_KEY } from './data/SurveyDataPage';
import { SurveyOverviewPage } from './overview/SurveyOverviewPage';
import { SamplingPeriodContainer } from './sampling/period/SamplingPeriodContainer';
import { SamplingSiteContainer } from './sampling/site/SamplingSiteContainer';
import { SAMPLING_ACTIVE_VIEW_KEY } from './sampling/SurveySamplingPage';
import { SamplingTechniqueContainer } from './sampling/technique/SamplingTechniqueContainer';
import { HiearchicalSurveyViewToggle } from './sidebar/HierarchicalSurveyViewToggle';

const SURVEY_ACTIVE_VIEW_KEY = 'sv';
const DEFAULT_VIEW = SURVEY_ACTIVE_VIEW_VALUE.overview;

interface SurveyDetailsTabProps {
  checklist: IGetSurveyChecklist;
}

export const SurveyDetailsTab = ({ checklist }: SurveyDetailsTabProps) => {
  const codesContext = useContext(CodesContext);
  const [showProgress, setShowProgress] = useState(false);

  const { searchParams, setSearchParams } = useSearchParams<{ [SURVEY_ACTIVE_VIEW_KEY]: SURVEY_VIEW_VALUE }>();
  const activeView = (searchParams.get(SURVEY_ACTIVE_VIEW_KEY) ?? DEFAULT_VIEW) as SURVEY_VIEW_VALUE;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.has(SURVEY_ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(SURVEY_ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetActiveView = (view: SURVEY_VIEW_VALUE) => {
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
          {() => (
            <SidebarLayout
              sx={{ borderRadius: '4px' }}
              sidebar={
                <Box
                  p={2}
                  sx={{
                    minWidth: 250,
                    width: showProgress ? '30%' : 400,
                    transition: 'width 0.3s ease',
                    overflowX: 'hidden'
                  }}>
                  <Paper
                    role="button"
                    tabIndex={0}
                    elevation={0}
                    onClick={() => setShowProgress((prev) => !prev)}
                    sx={{
                      bgcolor: grey[50],
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.1s linear, background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: grey[100]
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${grey[400]}`,
                        outlineOffset: 2
                      }
                    }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography component="legend">Checklist</Typography>
                      <Icon path={mdiArrowExpand} size={0.8} color={grey[500]} style={{ marginTop: '2px' }} />
                    </Box>
                    <Box mt={1}>
                      <LinearProgressWithLabel value={checklist.progress_percentage} />
                    </Box>
                  </Paper>

                  <HiearchicalSurveyViewToggle
                    checklist={checklist}
                    activeView={activeView}
                    setActiveView={handleSetActiveView}
                  />
                </Box>
              }>
              <ComponentSwitch
                switch={activeView}
                components={{
                  [SURVEY_ACTIVE_VIEW_VALUE.overview]: <SurveyOverviewPage />,
                  [SAMPLING_ACTIVE_VIEW_VALUE.sites]: <SamplingSiteContainer />,
                  [SAMPLING_ACTIVE_VIEW_VALUE.techniques]: <SamplingTechniqueContainer />,
                  [SAMPLING_ACTIVE_VIEW_VALUE.periods]: <SamplingPeriodContainer />,
                  [DATA_ACTIVE_VIEW_VALUE.observations]: <SurveySpatialObservations />,
                  [DATA_ACTIVE_VIEW_VALUE.devices]: <DevicesContainer />,
                  [DATA_ACTIVE_VIEW_VALUE.deployments]: <SurveyDeploymentList />,
                  [DATA_ACTIVE_VIEW_VALUE.locations]: <SurveySpatialTelemetry />,
                  [DATA_ACTIVE_VIEW_VALUE.animals]: <SurveySpatialAnimals />,
                  [DATA_ACTIVE_VIEW_VALUE.habitat]: <SurveySpatialHabitatFeatures />,
                  [SURVEY_ACTIVE_VIEW_VALUE.permissions]: <SurveyMembersContainer />
                }}
              />
            </SidebarLayout>
          )}
        </SurveyChecklistManager>
      </Box>
    </Box>
  );
};
