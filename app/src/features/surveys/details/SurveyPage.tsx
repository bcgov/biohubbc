import { useCallback, useContext, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { mdiCalendarClock, mdiDatabaseSearch, mdiFileOutline, mdiHome } from '@mdi/js';

import { LoadingGuard } from 'components/loading/LoadingGuard';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { ToggleButtonView } from 'components/toolbar/HierarchicalCustomToggleButtonGroup';

import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';

import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSearchParams } from 'hooks/useSearchParams';

import SurveyAttachments from '../view/SurveyAttachments';
import SurveyHeader from '../view/SurveyHeader';
import { SurveyDataPage } from './data/SurveyDataPage';
import { SurveyOverviewPage } from './overview/SurveyOverviewPage';

import { IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { SAMPLING_ACTIVE_VIEW_VALUE, SurveySamplingPage } from './sampling/SurveySamplingPage';

const ACTIVE_VIEW_KEY = 'v';

export enum SURVEY_ACTIVE_VIEW_VALUE {
  overview = 'overview',
  sampling = 'sampling',
  data = 'data',
  attachments = 'attachments'
}

export type ChecklistItem = IGetSurveyChecklistItem &
  ToggleButtonView<SURVEY_ACTIVE_VIEW_VALUE | SAMPLING_ACTIVE_VIEW_VALUE> & { children?: ChecklistItem[] };

const DEFAULT_VIEW = SURVEY_ACTIVE_VIEW_VALUE.overview;

export const SurveyPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  // URL search params for active view
  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: SURVEY_ACTIVE_VIEW_VALUE }>();

  useEffect(() => {
    codesContext.codesDataLoader.load();

    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as SURVEY_ACTIVE_VIEW_VALUE;

  // Recursively flatten checklist data into ChecklistItem array
  const flattenChecklistItems = useCallback(
    (items: Record<string, any>): ChecklistItem[] =>
      Object.entries(items).flatMap(([key, item]) => {
        const children = item.children ? flattenChecklistItems(item.children) : [];
        return [
          {
            ...item,
            label: key,
            value: item.checklist_item_name ?? key,
            checked: !!item.count,
            disabled: !item.applicable,
            checkbox: true,
            children: children.length ? children : undefined
          }
        ];
      }),
    []
  );

  // Prepare checklist items combining all categories
  const checklistItems = useMemo(() => {
    if (!checklist) {
      return [];
    }

    return [
      ...flattenChecklistItems(checklist.sampling),
      ...flattenChecklistItems({
        ...(checklist.data.animals && { animals: checklist.data.animals }),
        ...(checklist.data.habitat && { habitat: checklist.data.habitat }),
        ...(checklist.data.observations && { observations: checklist.data.observations })
      }),
      ...flattenChecklistItems(checklist.data.telemetry),
      ...flattenChecklistItems({ attachments: checklist.attachments })
    ];
  }, [checklist, flattenChecklistItems]);

  // Flatten checklist items (and their children) into a single-level array
  const flattenedChecklistItems = useMemo(() => {
    const flatten = (items: ChecklistItem[]): ChecklistItem[] =>
      items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);

    return flatten(checklistItems);
  }, [checklistItems]);

  // Update active view in URL search params
  const handleViewChange = (view: SURVEY_ACTIVE_VIEW_VALUE) => {
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, view, { replace: true }));
  };

  // Bulk item names to ignore by view
  const BULK_IGNORE_MAP: Record<SURVEY_ACTIVE_VIEW_VALUE, string[]> = useMemo(
    () => ({
      [SURVEY_ACTIVE_VIEW_VALUE.data]: [
        'observations',
        'devices',
        'deployments',
        'locations',
        'habitat_features',
        'animals'
      ],
      [SURVEY_ACTIVE_VIEW_VALUE.sampling]: ['sites', 'techniques', 'periods'],
      [SURVEY_ACTIVE_VIEW_VALUE.overview]: [],
      [SURVEY_ACTIVE_VIEW_VALUE.attachments]: []
    }),
    []
  );

  // Handle checkbox toggle for ignoring/unignoring checklist items
  const handleCheckboxClick = useCallback(
    async (view: ToggleButtonView<SURVEY_ACTIVE_VIEW_VALUE>) => {
      const itemMap = flattenedChecklistItems.reduce<Record<string, ChecklistItem>>((acc, item) => {
        acc[item.value] = item;
        return acc;
      }, {});

      // Handle bulk ignores for data & sampling views
      if (view.value === SURVEY_ACTIVE_VIEW_VALUE.data || view.value === SURVEY_ACTIVE_VIEW_VALUE.sampling) {
        const itemsToIgnore = BULK_IGNORE_MAP[view.value];
        const applicableItems = flattenedChecklistItems
          .filter((item) => itemsToIgnore.includes(item.checklist_item_name) && item.applicable)
          .map((item) => item.checklist_item_name);

        if (applicableItems.length > 0) {
          await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, applicableItems);
          await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
        }
        return;
      }

      // Handle individual item toggle
      const item = itemMap[view.value];

      if (!item) {
        return;
      }

      item.applicable
        ? await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name])
        : await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);

      await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
    },
    [
      flattenedChecklistItems,
      biohubApi.checklist,
      surveyContext.surveyId,
      surveyContext.surveyChecklistDataLoader,
      BULK_IGNORE_MAP
    ]
  );

  const views = useMemo(
    () => [
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.overview,
        label: 'Overview',
        icon: mdiHome
      },
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.sampling,
        label: 'Sampling',
        icon: mdiCalendarClock,
        checkbox: true,
        // Define counts inline
        indeterminate: (() => {
          const counts = [
            checklist?.sampling.sites.count,
            checklist?.sampling.techniques.count,
            checklist?.sampling.periods.count
          ];
          return counts.some((count) => (count ?? 0) > 0) && !counts.every((count) => (count ?? 0) > 0);
        })(),
        checked:
          !!checklist?.sampling.sites.count ||
          !!checklist?.sampling.techniques.count ||
          !!checklist?.sampling.periods.count,
        disabled:
          !checklist?.sampling.sites?.applicable &&
          !checklist?.sampling.techniques?.applicable &&
          !checklist?.sampling.periods?.applicable
      },
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.data,
        label: 'Data',
        icon: mdiDatabaseSearch,
        checkbox: true,
        checked:
          !!checklist?.data.observations.count ||
          !!checklist?.data.telemetry.devices.count ||
          !!checklist?.data.telemetry.deployments.count ||
          !!checklist?.data.telemetry.locations.count ||
          !!checklist?.data.habitat.count ||
          !!checklist?.data.animals.count,
        disabled:
          !checklist?.data.observations?.applicable &&
          !checklist?.data.telemetry.devices?.applicable &&
          !checklist?.data.telemetry.deployments?.applicable &&
          !checklist?.data.telemetry.locations?.applicable &&
          !checklist?.data.habitat?.applicable &&
          !checklist?.data.animals?.applicable
      },
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.attachments,
        label: 'Supplementary',
        icon: mdiFileOutline,
        checkbox: true,
        disabled: !checklist?.attachments?.applicable,
        checked: !!checklist?.attachments.count
      }
    ],
    [checklist]
  );

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ my: 3, p: 0, px: 2 }} disableGutters>
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
                      <Skeleton variant="rectangular" width={100} height={30} />
                      <Skeleton variant="rectangular" width="100%" height={150} />
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width="100%" height={75} />
                      ))}
                    </Stack>
                  </Box>
                }>
                {activeView && (
                  <ComponentSwitch
                    switch={activeView}
                    components={{
                      [SURVEY_ACTIVE_VIEW_VALUE.overview]: <SurveyOverviewPage />,
                      [SURVEY_ACTIVE_VIEW_VALUE.sampling]: (
                        <SurveySamplingPage checklistItems={flattenedChecklistItems} />
                      ),
                      [SURVEY_ACTIVE_VIEW_VALUE.data]: <SurveyDataPage />,
                      [SURVEY_ACTIVE_VIEW_VALUE.attachments]: <SurveyAttachments />
                    }}
                  />
                )}
              </LoadingGuard>
            </Box>
          </Box>
        </SidebarLayout>
      </Container>
    </>
  );
};
