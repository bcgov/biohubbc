import { mdiCalendarClock, mdiDatabaseSearch, mdiFileOutline, mdiHome } from '@mdi/js';
import {
  HierarchicalCustomToggleButtonGroup,
  HierarchicalToggleButtonView
} from 'components/toggle/HierarchicalCustomToggleButtonGroup';
import { SURVEY_ACTIVE_VIEW_VALUE, SURVEY_VIEW_VALUE } from 'constants/survey-view';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSurveyChecklist, IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { useCallback, useContext } from 'react';

type HiearchicalSurveyViewToggleProps = {
  checklist: IGetSurveyChecklist;
  activeView: SURVEY_VIEW_VALUE;
  setActiveView: (v: SURVEY_VIEW_VALUE) => void;
};

type ChecklistItemNode = IGetSurveyChecklistItem & {
  children?: Record<SURVEY_VIEW_VALUE, ChecklistItemNode>;
};

/**
 * Recursively transforms a checklist record into a tree of toggle button views.
 */
export const transformChecklistToViews = (
  items: Record<string, ChecklistItemNode>
): HierarchicalToggleButtonView<SURVEY_VIEW_VALUE>[] => {
  return Object.entries(items).map(([key, item]) => {
    const value = item.checklist_item_name as SURVEY_VIEW_VALUE;
    return {
      label: key,
      value,
      checked: !!item.count,
      disabled: !item.applicable,
      checkbox: true,
      children: item.children ? transformChecklistToViews(item.children) : undefined
    };
  });
};

export const HiearchicalSurveyViewToggle = ({
  checklist,
  activeView,
  setActiveView
}: HiearchicalSurveyViewToggleProps) => {
  const { surveyId, surveyChecklistDataLoader } = useContext(SurveyContext);
  const { checklist: checklistApi } = useBiohubApi();

  const handleCheckboxClick = useCallback(
    async (view: HierarchicalToggleButtonView<string>) => {
      if (!view.disabled) {
        await checklistApi.ignoreSurveyChecklistItems(surveyId, [view.value]);
      } else {
        await checklistApi.unignoreSurveyChecklistItems(surveyId, [view.value]);
      }

      await surveyChecklistDataLoader.refresh(surveyId);
    },
    [checklistApi, surveyId, surveyChecklistDataLoader]
  );

  const treeViews: HierarchicalToggleButtonView<SURVEY_VIEW_VALUE>[] = [
    {
      value: SURVEY_ACTIVE_VIEW_VALUE.overview,
      label: 'Overview',
      icon: mdiHome
    },
    {
      label: 'Sampling',
      value: 'sampling-group' as SURVEY_VIEW_VALUE,
      isHeader: true,
      icon: mdiCalendarClock,
      children: transformChecklistToViews(checklist?.sampling ?? {})
    },
    {
      label: 'Data',
      value: 'data-group' as SURVEY_VIEW_VALUE,
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
          value: 'telemetry-group' as SURVEY_VIEW_VALUE,
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
      value: 'attachments-group' as SURVEY_VIEW_VALUE,
      isHeader: true,
      icon: mdiFileOutline,
      children: transformChecklistToViews({ attachments: checklist.attachments })
    }
  ];

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
