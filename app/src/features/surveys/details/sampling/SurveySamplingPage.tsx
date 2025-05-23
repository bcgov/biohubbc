import { mdiClockOutline, mdiMapMarkerOutline, mdiToolboxOutline } from '@mdi/js';
import { CircularProgress, Skeleton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import CustomToggleButtonGroup, { ToggleButtonView } from 'components/toolbar/CustomToggleButtonGroup';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useCallback, useContext, useEffect } from 'react';
import { ChecklistItem } from '../SurveyPage';
import { SamplingPeriodContainer } from './period/SamplingPeriodContainer';
import { SamplingSiteContainer } from './site/SamplingSiteContainer';
import { SamplingTechniqueContainer } from './technique/SamplingTechniqueContainer';

const ACTIVE_VIEW_KEY = 'cv';

export enum SAMPLING_ACTIVE_VIEW_VALUE {
  sites = 'sites',
  techniques = 'techniques',
  periods = 'periods'
}

const DEFAULT_VIEW = SAMPLING_ACTIVE_VIEW_VALUE.sites;

interface ISurveySamplingPageProps {
  checklistItems: ChecklistItem[];
}

export const SurveySamplingPage = (props: ISurveySamplingPageProps) => {
  const { checklistItems } = props;

  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();
  const codesContext = useContext(CodesContext);

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: SAMPLING_ACTIVE_VIEW_VALUE }>();

  useEffect(() => {
    codesContext.codesDataLoader.load();

    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as SAMPLING_ACTIVE_VIEW_VALUE;

  const handleViewChange = (view: SAMPLING_ACTIVE_VIEW_VALUE) => {
    const updatedView = view ?? DEFAULT_VIEW;
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, updatedView));
  };

  // Handle checkbox toggle for ignoring/unignoring checklist items
  const handleCheckboxClick = useCallback(
    async (view: ToggleButtonView<SAMPLING_ACTIVE_VIEW_VALUE>) => {
      // Handle individual item toggle
      const item = checklistItems.find((item) => item.value === view.value);

      if (!item) {
        return;
      }

      item.applicable
        ? await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name])
        : await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);

      await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
    },
    [checklistItems, surveyContext.surveyId, surveyContext.surveyChecklistDataLoader, biohubApi.checklist]
  );

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const views = [
    {
      value: SAMPLING_ACTIVE_VIEW_VALUE.sites,
      label: 'Sites',
      icon: mdiMapMarkerOutline,
      checkbox: true,
      disabled: !checklist.sampling.sites.applicable,
      isChecked: !!checklist.sampling.sites.count
    },
    {
      value: SAMPLING_ACTIVE_VIEW_VALUE.techniques,
      label: 'Techniques',
      icon: mdiToolboxOutline,
      checkbox: true,
      disabled: !checklist.sampling.techniques.applicable,
      isChecked: !!checklist.sampling.techniques.count
    },
    {
      value: SAMPLING_ACTIVE_VIEW_VALUE.periods,
      label: 'Periods',
      icon: mdiClockOutline,
      checkbox: true,
      disabled: !checklist.sampling.periods.applicable,
      isChecked: !!checklist.sampling.periods.count
    }
  ];

  return (
    <SidebarLayout
      sidebar={
        <Box p={2}>
          <CustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={handleViewChange}
            handleCheckboxClick={handleCheckboxClick}
            orientation="vertical"
          />
        </Box>
      }>
      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
          <LoadingGuard
            isLoading={codesContext.codesDataLoader.isLoading || surveyContext.surveyDataLoader.isLoading}
            isLoadingFallbackDelay={600}
            isLoadingFallback={
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" width="100px" height="30px" />
                  <Skeleton variant="rectangular" width="100%" height="150px" />
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" width="100%" height="75px" />
                  ))}
                </Stack>
              </Box>
            }>
            {activeView && (
              <Box sx={{ width: '100%', height: '100%' }}>
                <ComponentSwitch
                  switch={activeView}
                  components={{
                    [SAMPLING_ACTIVE_VIEW_VALUE.sites]: <SamplingSiteContainer />,
                    [SAMPLING_ACTIVE_VIEW_VALUE.techniques]: <SamplingTechniqueContainer />,
                    [SAMPLING_ACTIVE_VIEW_VALUE.periods]: <SamplingPeriodContainer />
                  }}
                />
              </Box>
            )}
          </LoadingGuard>
        </Box>
      </Box>
    </SidebarLayout>
  );
};
