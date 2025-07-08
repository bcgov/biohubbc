import { mdiAccountMultiple, mdiCalendarClock, mdiDatabaseSearch, mdiFileOutline, mdiHome } from '@mdi/js';
import { ToggleButtonView } from 'components/toggle/CustomToggleButtonGroup';
import { HierarchicalCustomToggleButtonGroup } from 'components/toggle/HierarchicalCustomToggleButtonGroup';
import { DATA_ACTIVE_VIEW_VALUE, SURVEY_ACTIVE_VIEW_VALUE, SURVEY_VIEW_VALUE } from 'constants/survey-view';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCallback, useContext, useMemo } from 'react';
import { SAMPLING_ACTIVE_VIEW_VALUE } from '../sampling/SurveySamplingPage';

type SurveyViewToggleProps = {
  checklist: any;
  activeView: SURVEY_VIEW_VALUE;
  setActiveView: (v: SURVEY_VIEW_VALUE) => void;
};

export const SurveyViewToggle = ({ checklist, activeView, setActiveView }: SurveyViewToggleProps) => {
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();

  const flattenedChecklistItems = useMemo(() => {
    const flatten = (items: Record<string, any>): any[] =>
      Object.entries(items).flatMap(([key, item]) => {
        const children = item.children ? flatten(item.children) : [];
        return [
          {
            ...item,
            label: key,
            value: item.checklist_item_name ?? key,
            checked: !!item.count,
            disabled: !item.applicable,

            children: children.length ? children : undefined
          }
        ];
      });

    return [
      ...flatten(checklist?.sampling ?? {}),
      ...flatten({
        ...(checklist?.data.animals && { animals: checklist.data.animals }),
        ...(checklist?.data.habitat && { habitat: checklist.data.habitat }),
        ...(checklist?.data.observations && { observations: checklist.data.observations })
      }),
      ...flatten(checklist?.data.telemetry ?? {}),
      ...flatten({ attachments: checklist.attachments })
    ];
  }, [checklist]);

  const BULK_IGNORE_MAP: Record<SURVEY_VIEW_VALUE, string[]> = useMemo(
    () => ({
      // Top-level views
      [SURVEY_ACTIVE_VIEW_VALUE.overview]: [],
      [SURVEY_ACTIVE_VIEW_VALUE.sampling]: ['sites', 'techniques', 'periods'],
      [SURVEY_ACTIVE_VIEW_VALUE.data]: ['observations', 'devices', 'deployments', 'locations', 'habitat', 'animals'],
      [SURVEY_ACTIVE_VIEW_VALUE.attachments]: [],
      [SURVEY_ACTIVE_VIEW_VALUE.permissions]: [],

      // Sampling sub-views
      [SAMPLING_ACTIVE_VIEW_VALUE.sites]: [],
      [SAMPLING_ACTIVE_VIEW_VALUE.techniques]: [],
      [SAMPLING_ACTIVE_VIEW_VALUE.periods]: [],

      // Data sub-views
      [DATA_ACTIVE_VIEW_VALUE.observations]: [],
      [DATA_ACTIVE_VIEW_VALUE.telemetry]: [],
      [DATA_ACTIVE_VIEW_VALUE.devices]: [],
      [DATA_ACTIVE_VIEW_VALUE.locations]: [],
      [DATA_ACTIVE_VIEW_VALUE.deployments]: [],
      [DATA_ACTIVE_VIEW_VALUE.animals]: [],
      [DATA_ACTIVE_VIEW_VALUE.habitat]: []
    }),
    []
  );

  const handleCheckboxClick = useCallback(
    async (view: ToggleButtonView<SURVEY_VIEW_VALUE>) => {
      const itemMap = flattenedChecklistItems.reduce<Record<string, any>>((acc, item) => {
        acc[item.value] = item;
        return acc;
      }, {});

      if (view.value === SURVEY_ACTIVE_VIEW_VALUE.data || view.value === SURVEY_ACTIVE_VIEW_VALUE.sampling) {
        const itemsToProcess = BULK_IGNORE_MAP[view.value];

        const relevantItems = flattenedChecklistItems.filter((item) =>
          itemsToProcess.includes(item.checklist_item_name)
        );

        const hasAnyApplicable = relevantItems.some((item) => item.applicable);

        const itemsToIgnore = hasAnyApplicable ? relevantItems.map((item) => item.checklist_item_name) : [];

        const itemsToUnignore = !hasAnyApplicable ? relevantItems.map((item) => item.checklist_item_name) : [];

        if (itemsToIgnore.length > 0) {
          await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, itemsToIgnore);
        }

        if (itemsToUnignore.length > 0) {
          await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, itemsToUnignore);
        }

        await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
        return;
      }

      const item = itemMap[view.value];

      if (!item) {
        return;
      }

      if (item.applicable) {
        await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);
      } else {
        await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);
      }

      await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
    },
    [biohubApi, flattenedChecklistItems, BULK_IGNORE_MAP, surveyContext]
  );

  const samplingCounts = useMemo(() => {
    const counts = [];

    if (checklist?.sampling.sites.applicable) {
      counts.push(checklist?.sampling.sites.count);
    }
    if (checklist?.sampling.techniques.applicable) {
      counts.push(checklist?.sampling.techniques.count);
    }
    if (checklist?.sampling.periods.applicable) {
      counts.push(checklist?.sampling.periods.count);
    }
    return counts;
  }, [checklist?.sampling]);

  const dataCounts = useMemo(
    () => [
      checklist?.data.observations.count,
      checklist?.data.telemetry.devices.count,
      checklist?.data.telemetry.deployments.count,
      checklist?.data.telemetry.locations.count,
      checklist?.data.habitat.count,
      checklist?.data.animals.count
    ],
    [checklist?.data]
  );

  const views: ToggleButtonView<SURVEY_VIEW_VALUE>[] = useMemo(
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

        indeterminate:
          samplingCounts.some((count) => (count ?? 0) > 0) && samplingCounts.some((count) => (count ?? 0) === 0),

        checked: samplingCounts.every((count) => (count ?? 0) > 0),

        disabled:
          !checklist?.sampling.sites?.applicable &&
          !checklist?.sampling.techniques?.applicable &&
          !checklist?.sampling.periods?.applicable
      },
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.data,
        label: 'Data',
        icon: mdiDatabaseSearch,

        indeterminate: dataCounts.some((count) => (count ?? 0) > 0) && dataCounts.some((count) => (count ?? 0) === 0),

        checked: dataCounts.every((count) => (count ?? 0) > 0),

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

        disabled: !checklist?.attachments?.applicable,
        checked: !!checklist?.attachments.count
      },
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.permissions,
        label: 'Members',
        icon: mdiAccountMultiple
      }
    ],
    [checklist, samplingCounts, dataCounts]
  );

  return (
    <HierarchicalCustomToggleButtonGroup
      views={views}
      activeView={activeView}
      onViewChange={setActiveView}
      handleCheckboxClick={handleCheckboxClick}
      orientation="vertical"
    />
  );
};
