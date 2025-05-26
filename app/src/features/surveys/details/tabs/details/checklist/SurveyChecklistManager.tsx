import { IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { useCallback, useMemo } from 'react';
import { DATA_ACTIVE_VIEW_VALUE } from '../data/SurveyDataPage';
import { SAMPLING_ACTIVE_VIEW_VALUE } from '../sampling/SurveySamplingPage';
import { SURVEY_ACTIVE_VIEW_VALUE } from '../SurveyDetailsTab';
import { ToggleButtonView } from './SurveyChecklist';

export type ChecklistItem = IGetSurveyChecklistItem &
  ToggleButtonView<SURVEY_ACTIVE_VIEW_VALUE | SAMPLING_ACTIVE_VIEW_VALUE | DATA_ACTIVE_VIEW_VALUE> & {
    children?: ChecklistItem[];
  };

type SurveyChecklistManagerProps = {
  checklist: any;
  children: (flattenedChecklistItems: ChecklistItem[]) => React.ReactNode;
};

export const SurveyChecklistManager = ({ checklist, children }: SurveyChecklistManagerProps) => {
  // Recursive flattening of checklist items, preserving children
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

  // Combine checklist categories into a single array
  const checklistItems = useMemo(() => {
    if (!checklist) {
      return [];
    }

    return [
      ...flattenChecklistItems(checklist.sampling ?? {}),
      ...flattenChecklistItems({
        ...(checklist.data.animals && { animals: checklist.data.animals }),
        ...(checklist.data.habitat && { habitat: checklist.data.habitat }),
        ...(checklist.data.observations && { observations: checklist.data.observations })
      }),
      ...flattenChecklistItems(checklist.data.telemetry ?? {}),
      ...flattenChecklistItems({ attachments: checklist.attachments })
    ];
  }, [checklist, flattenChecklistItems]);

  // Flatten all checklist items including children into one flat array
  const flattenedChecklistItems = useMemo(() => {
    const flatten = (items: ChecklistItem[]): ChecklistItem[] =>
      items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);

    return flatten(checklistItems);
  }, [checklistItems]);

  return <>{children(flattenedChecklistItems)}</>;
};
