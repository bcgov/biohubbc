import { Box, Button, Skeleton, Typography } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { HierarchicalCustomToggleButtonGroup } from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { IGetSurveyChecklist, IGetSurveyChecklistItem } from 'interfaces/useChecklistApi.interface';
import { useCallback, useMemo } from 'react';
import { ACTIVE_VIEW_VALUE, VIEW_MAP } from '../SurveyPage';
import { LinearProgressWithLabel } from './progress/SurveyChecklistProgressBar';

interface SurveyChecklistProps {
  checklist: IGetSurveyChecklist;
  activeView: ACTIVE_VIEW_VALUE | null;
  handleViewChange: (view: ACTIVE_VIEW_VALUE) => void;
}

type ChecklistItem = {
  value: ACTIVE_VIEW_VALUE;
  label: string;
  isChecked?: boolean;
  isHeader?: boolean;
  disabled?: boolean;
  order: number;
  checkbox?: boolean;
  handleCheckbox: (id: number) => Promise<void>;
  children?: ChecklistItem[];
};

export const SurveyChecklist = ({ checklist, activeView, handleViewChange }: SurveyChecklistProps) => {
  const { surveyId } = useSurveyContext();
  const biohubApi = useBiohubApi();

  const handleCheckboxClick = useCallback(
    (checkbox_item_id: number) => {
      return biohubApi.checklist.ignoreSurveyChecklistItem(surveyId, checkbox_item_id);
    },
    [biohubApi.checklist, surveyId]
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
            value: mappedValue.value,
            label: key,
            isChecked: !!item.count,
            disabled: !item.applicable,
            checkbox: true,
            handleCheckbox: handleCheckboxClick,
            order: mappedValue.order // Add order for sorting
          };
        })
        .filter((item): item is ChecklistItem => item !== null);
    };

    // 1. Telemetry subgroup
    const telemetryGroup: ChecklistItem = {
      value: ACTIVE_VIEW_VALUE.telemetry,
      label: 'Telemetry',
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
      handleCheckbox: handleCheckboxClick,
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
      isHeader: true,
      order: 0,
      handleCheckbox: handleCheckboxClick,
      children: [...otherDataItems, telemetryGroup]
    };

    // 4. Wrap all sampling items under 'Sampling' group
    const samplingGroup: ChecklistItem = {
      value: 'sampling' as ACTIVE_VIEW_VALUE,
      label: 'Sampling',
      isHeader: true,
      order: 0,
      checkbox: false,
      handleCheckbox: handleCheckboxClick,
      children: createItems(checklist.sampling)
    };

    // 5. Wrap all supplementary items under 'Supplementary' group
    const supplementaryGroup: ChecklistItem = {
      value: 'supplementary' as ACTIVE_VIEW_VALUE,
      label: 'Supplementary',
      isHeader: true,
      order: 0,
      checkbox: false,
      handleCheckbox: handleCheckboxClick,
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
  }, [checklist, handleCheckboxClick]);

  const progressValue = checklist?.progress_percentage ?? 0;

  return (
    <Box flexShrink={0} height="100%">
      {/* Progress Bar */}
      <Typography fontWeight={700} mt={1}>
        Progress
      </Typography>
      <Box my={2}>
        <LoadingGuard isLoadingFallback={<Skeleton variant="rectangular" height="8px" width="100%" />}>
          <LinearProgressWithLabel value={progressValue} suffix="complete" />
        </LoadingGuard>
      </Box>

      {/* Checklist Toggle Buttons */}
      <HierarchicalCustomToggleButtonGroup
        views={checklistItems}
        activeView={activeView}
        onViewChange={handleViewChange}
        orientation="vertical"
      />

      {/* Publish Button */}
      <Button fullWidth variant="contained" sx={{ mt: 3 }}>
        Publish
      </Button>
    </Box>
  );
};
