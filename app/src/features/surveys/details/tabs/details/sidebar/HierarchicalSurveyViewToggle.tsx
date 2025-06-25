import { mdiCalendarClock, mdiDatabaseSearch, mdiFileOutline, mdiHome } from '@mdi/js';
import { ToggleButtonView } from 'components/toggle/CustomToggleButtonGroup';
import { HierarchicalCustomToggleButtonGroup } from 'components/toggle/HierarchicalCustomToggleButtonGroup';
import { SURVEY_ACTIVE_VIEW_VALUE, SURVEY_VIEW_VALUE } from 'constants/survey-view';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCallback, useContext, useMemo } from 'react';

type HiearchicalSurveyViewToggleProps = {
  checklist: any;
  activeView: SURVEY_VIEW_VALUE;
  setActiveView: (v: SURVEY_VIEW_VALUE) => void;
};

export const HiearchicalSurveyViewToggle = ({
  checklist,
  activeView,
  setActiveView
}: HiearchicalSurveyViewToggleProps) => {
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();

  // Recursive helper to transform checklist -> ToggleButtonView[]
  const transformChecklistToViews = useCallback((items: Record<string, any>): ToggleButtonView<string>[] => {
    return Object.entries(items).map(([key, item]) => {
      const children = item.children ? transformChecklistToViews(item.children) : undefined;

      return {
        label: key,
        value: item.checklist_item_name ?? key,
        checked: !!item.count,
        disabled: !item.applicable,
        checkbox: true,
        children
      };
    });
  }, []);

  const treeViews: ToggleButtonView<SURVEY_ACTIVE_VIEW_VALUE>[] = useMemo(() => {
    if (!checklist) {
      return [];
    }

    return [
      {
        value: SURVEY_ACTIVE_VIEW_VALUE.overview,
        label: 'Overview',
        icon: mdiHome
      },
      {
        label: 'Sampling',
        value: 'sampling-group' as SURVEY_ACTIVE_VIEW_VALUE,
        isHeader: true,

        icon: mdiCalendarClock,
        children: transformChecklistToViews(checklist?.sampling ?? {})
      },
      {
        label: 'Data',
        value: 'data-group' as SURVEY_ACTIVE_VIEW_VALUE,
        isHeader: true,

        icon: mdiDatabaseSearch,
        children: [
          ...transformChecklistToViews({
            ...(checklist?.data.animals && { animals: checklist.data.animals }),
            ...(checklist?.data.habitat && { habitat: checklist.data.habitat }),
            ...(checklist?.data.observations && { observations: checklist.data.observations })
          }),
          {
            label: 'Telemetry',
            value: 'telemetry-group' as SURVEY_ACTIVE_VIEW_VALUE,
            isHeader: true,

            children: transformChecklistToViews({
              ...(checklist?.data.telemetry?.devices && { devices: checklist.data.telemetry.devices }),
              ...(checklist?.data.telemetry?.deployments && { deployments: checklist.data.telemetry.deployments }),
              ...(checklist?.data.telemetry?.locations && { locations: checklist.data.telemetry.locations })
            })
          }
        ]
      },
      {
        label: 'Supplementary',
        value: 'attachments-group' as SURVEY_ACTIVE_VIEW_VALUE,
        isHeader: true,

        icon: mdiFileOutline,
        children: transformChecklistToViews({ attachments: checklist.attachments })
      }
    ];
  }, [checklist, transformChecklistToViews]);

  const handleCheckboxClick = useCallback(
    async (view: ToggleButtonView<string>) => {
      if (!view.value || view.value.endsWith('-group')) {
        return;
      }

      const isApplicable = view.checked;

      if (isApplicable) {
        await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, [view.value]);
      } else {
        await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, [view.value]);
      }

      await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
    },
    [biohubApi, surveyContext]
  );

  return (
    <HierarchicalCustomToggleButtonGroup
      views={treeViews}
      activeView={activeView}
      onViewChange={setActiveView}
      handleCheckboxClick={handleCheckboxClick}
      orientation="vertical"
      fixedExpanded
    />
  );
};
