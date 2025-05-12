import { Box, Button, Typography } from '@mui/material';
import { HierarchicalCustomToggleButtonGroup } from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { useSurveyContext } from 'hooks/useContext';
import { usePersistentState } from 'hooks/usePersistentState';
import { IGetSurveyChecklist, IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { useMemo } from 'react';
import { ACTIVE_VIEW_VALUE, VIEW_MAP } from '../SurveyPage';
import { LinearProgressWithLabel } from './progress/SurveyChecklistProgressBar';

interface SurveyChecklistProps {
  checklist: IGetSurveyChecklist;
  activeView: ACTIVE_VIEW_VALUE | null;
  handleViewChange: (view: ACTIVE_VIEW_VALUE) => void;
  handleCheckboxClick: (item: IGetSurveyChecklistItem) => Promise<void>;
}

type ChecklistItem = IGetSurveyChecklistItem & {
  value: ACTIVE_VIEW_VALUE;
  label: string;
  isChecked?: boolean;
  isHeader?: boolean;
  disabled?: boolean;
  order: number;
  checkbox?: boolean;
  children?: ChecklistItem[];
};

/**
 * Displays a checklist of survey items that have been added, and a progress bar indicating how complete the survey is
 *
 * @param {SurveyChecklistProps} props
 * @returns
 */
export const SurveyChecklist = (props: SurveyChecklistProps) => {
  const { checklist, activeView, handleViewChange, handleCheckboxClick } = props;

  const { surveyId } = useSurveyContext();

  const [expanded, setExpanded] = usePersistentState<Set<ACTIVE_VIEW_VALUE>>(
    `${surveyId}_survey_checklist_expanded`,
    new Set()
  );

  const checklistItems = useMemo(() => {
    if (!checklist) {
      return [];
    }

    const createItems = (items: Record<string, IGetSurveyChecklistItem>): ChecklistItem[] => {
      return Object.entries(items)
        .map(([key, item]): ChecklistItem | null => {
          const mappedValue = VIEW_MAP[item.checklist_item_name];

          if (!mappedValue) {
            return null;
          }

          return {
            ...item,
            value: mappedValue.value,
            label: key,
            isChecked: !!item.count,
            disabled: !item.applicable,
            checkbox: true,
            order: mappedValue.order
          };
        })
        .filter((item): item is ChecklistItem => item !== null);
    };

    // 1. Telemetry subgroup
    const telemetryGroup: ChecklistItem = {
      value: ACTIVE_VIEW_VALUE.telemetry,
      label: 'Telemetry',
      checklist_item_name: 'telemetry', // dummy value to satisfy the type, not actually used here
      count: 0,
      applicable: true,
      checkbox: true,
      isHeader: true,
      order: 5,
      isChecked:
        !!checklist.data.telemetry.devices.count ||
        !!checklist.data.telemetry.deployments.count ||
        !!checklist.data.telemetry.locations.count,
      disabled:
        !checklist.data.telemetry.devices.applicable &&
        !checklist.data.telemetry.deployments.applicable &&
        !checklist.data.telemetry.locations.applicable,
      children: createItems(checklist.data.telemetry)
    };

    // 2. Other 'data' checklist items
    const otherDataItems = createItems({
      ...(checklist.data.animals && { animals: checklist.data.animals }),
      ...(checklist.data.habitat && { habitat: checklist.data.habitat }),
      ...(checklist.data.observations && { observations: checklist.data.observations })
    });

    // 3. Wrap all data items under 'Data' group
    const dataGroup: ChecklistItem = {
      value: 'data' as ACTIVE_VIEW_VALUE,
      label: 'Data',
      checklist_item_name: 'data', // dummy value
      count: 0,
      applicable: true,
      isHeader: true,
      order: 0,
      children: [...otherDataItems, telemetryGroup]
    };

    // 4. Wrap all sampling items under 'Sampling' group
    const samplingGroup: ChecklistItem = {
      value: 'sampling' as ACTIVE_VIEW_VALUE,
      label: 'Sampling',
      checklist_item_name: 'sampling', // dummy value
      count: 0,
      applicable: true,
      isHeader: true,
      order: 0,
      checkbox: false,
      children: createItems(checklist.sampling)
    };

    // 5. Wrap all supplementary items under 'Supplementary' group
    const supplementaryGroup: ChecklistItem = {
      value: 'supplementary' as ACTIVE_VIEW_VALUE,
      label: 'Supplementary',
      checklist_item_name: 'supplementary', // dummy value
      count: 0,
      applicable: true,
      isHeader: true,
      order: 0,
      checkbox: false,
      children: createItems({ attachments: checklist.attachments })
    };

    // Combine all groups
    const allGroups = [samplingGroup, dataGroup, supplementaryGroup];

    // Sort groups based on the `VIEW_MAP` order
    const sortedGroups = allGroups.sort((a, b) => {
      const aOrder = VIEW_MAP[a.value]?.order ?? Infinity;
      const bOrder = VIEW_MAP[b.value]?.order ?? Infinity;
      return aOrder - bOrder;
    });

    // Recursive function to sort items and their children
    const sortItems = (items: ChecklistItem[]): ChecklistItem[] => {
      return items
        .map((item) => {
          if (item.children) {
            // Sort children recursively
            item.children = sortItems(item.children);
          }
          return item;
        })
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    };

    // Sort items and nested children recursively
    sortedGroups.forEach((group) => {
      if (group.children) {
        group.children = sortItems(group.children);
      }
    });

    return sortedGroups;
  }, [checklist]);

  const flattenedChecklistItems = useMemo(() => {
    const flattenItems = (items: ChecklistItem[]): ChecklistItem[] => {
      return items.flatMap((item: ChecklistItem) => {
        const flattenedItem = {
          ...item
        };

        // Recursively flatten children if they exist
        const subitems = item.children ? flattenItems(item.children) : [];

        return [flattenedItem, ...subitems];
      });
    };

    return flattenItems(checklistItems);
  }, [checklistItems]);

  const progressValue = checklist?.progress_percentage ?? 0;

  return (
    <Box flexShrink={0} height="100%">
      {/* Progress Bar */}
      <Typography fontWeight={700} mt={1}>
        Progress
      </Typography>
      <Box my={2}>
        <LinearProgressWithLabel value={progressValue} suffix="complete" />
      </Box>

      {/* Checklist Toggle Buttons */}
      <HierarchicalCustomToggleButtonGroup
        views={checklistItems}
        activeView={activeView}
        onViewChange={handleViewChange}
        orientation="vertical"
        handleCheckbox={(item) => {
          const checklistObject = flattenedChecklistItems.find((checklistItem) => checklistItem.value === item.value);

          if (checklistObject) {
            handleCheckboxClick(checklistObject);

            if (item.value === activeView) {
              const findNextValidView = (items: ChecklistItem[]): ACTIVE_VIEW_VALUE | null => {
                for (const item of items) {
                  if (!item.isHeader && !item.disabled && item.value !== activeView) {
                    return item.value;
                  }
                  if (item.children) {
                    const childResult = findNextValidView(item.children);
                    if (childResult) {
                      return childResult;
                    }
                  }
                }
                return null;
              };

              const nextView = findNextValidView(checklistItems);
              if (nextView) {
                handleViewChange(nextView);
              }
            }
          }
        }}
        expanded={expanded}
        handleExpand={setExpanded}
      />

      {/* Publish Button */}
      <Button fullWidth variant="contained" sx={{ mt: 3 }}>
        Publish
      </Button>
    </Box>
  );
};
