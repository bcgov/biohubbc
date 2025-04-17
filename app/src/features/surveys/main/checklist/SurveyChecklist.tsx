import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  HierarchicalCustomToggleButtonGroup,
  ToggleButtonView
} from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { IGetSurveyChecklist } from 'interfaces/useSurveyApi.interface';
import { useCallback, useMemo } from 'react';
import { ACTIVE_VIEW_VALUE } from '../SurveyPage';
import { LinearProgressWithLabel } from './progress/SurveyChecklistProgressBar';

interface SurveyChecklistProps {
  checklist: IGetSurveyChecklist;
  activeView: ACTIVE_VIEW_VALUE | null;
  handleViewChange: (view: ACTIVE_VIEW_VALUE) => void;
}

export const SurveyChecklist = (props: SurveyChecklistProps) => {
  const { checklist, activeView, handleViewChange } = props;

  const flattenLeafViews = useCallback(
    (items: ToggleButtonView<ACTIVE_VIEW_VALUE>[]): ToggleButtonView<ACTIVE_VIEW_VALUE>[] =>
      items.flatMap((item) => (item.children ? flattenLeafViews(item.children) : [item])),
    []
  );

  const checklistItems = useMemo((): ToggleButtonView<ACTIVE_VIEW_VALUE>[] => {
    if (!checklist) {
      return [];
    }

    return [
      {
        value: ACTIVE_VIEW_VALUE.overview,
        label: 'Overview'
      },
      {
        value: ACTIVE_VIEW_VALUE.sampling,
        label: 'Sampling',
        isHeader: true,
        tooltip: 'Add information about where, when, and how you collected data',
        children: [
          {
            value: ACTIVE_VIEW_VALUE.sites,
            label: 'Sites',
            isChecked: !!checklist.sampling?.sites,
            checkbox: true,
            tooltip: 'Add sampling sites showing where you collected data'
          },
          {
            value: ACTIVE_VIEW_VALUE.techniques,
            label: 'Techniques',
            isChecked: !!checklist.sampling?.techniques,
            checkbox: true,
            tooltip: 'Add methods describing how you collected data'
          },
          {
            value: ACTIVE_VIEW_VALUE.periods,
            label: 'Periods',
            isChecked: !!checklist.sampling?.periods,
            checkbox: true,
            tooltip: 'Add time periods describing when you did a sampling method at a site'
          }
        ]
      },
      {
        value: ACTIVE_VIEW_VALUE.data,
        label: 'Data',
        isHeader: true,
        tooltip: 'Add data that you collected',
        children: [
          {
            value: ACTIVE_VIEW_VALUE.observations,
            label: 'Observations',
            isChecked: !!checklist.data?.observations,
            checkbox: true,
            tooltip: 'Add observations of species'
          },
          {
            value: ACTIVE_VIEW_VALUE.telemetry,
            label: 'Telemetry',
            isChecked: !!checklist.data?.telemetry,
            isHeader: true,
            tooltip: 'Add telemetry data',
            children: [
              {
                value: ACTIVE_VIEW_VALUE.devices,
                label: 'Devices',
                isChecked: !!checklist.data?.telemetry,
                checkbox: true,
                tooltip: 'Add telemetry data'
              },
              {
                value: ACTIVE_VIEW_VALUE.deployments,
                label: 'Deployments',
                isChecked: !!checklist.data?.telemetry,
                checkbox: true,
                tooltip: 'Add telemetry data'
              },
              {
                value: ACTIVE_VIEW_VALUE.locations,
                label: 'Locations',
                isChecked: !!checklist.data?.telemetry,
                checkbox: true,
                tooltip: 'Add telemetry data'
              }
            ]
          },
          {
            value: ACTIVE_VIEW_VALUE.animals,
            label: 'Animals',
            isChecked: !!checklist.data?.animals,
            checkbox: true,
            tooltip: 'Add individual animals that you captured or marked'
          },
          {
            value: ACTIVE_VIEW_VALUE.habitat,
            label: 'Habitat Features',
            isChecked: !!checklist.data?.habitat,
            checkbox: true,
            tooltip: 'Add observations of habitat features like nests or dens'
          }
        ]
      },
      {
        value: ACTIVE_VIEW_VALUE.attachments,
        label: 'Attachments',
        isHeader: true,
        tooltip: 'Add supplementary files',
        children: [
          {
            value: ACTIVE_VIEW_VALUE.attachments,
            label: 'Attachments',
            isChecked: !!checklist.attachments,
            checkbox: true,
            tooltip: 'Add supplementary files'
          }
        ]
      }
    ];
  }, [checklist]);

  const leafItems = useMemo(() => flattenLeafViews(checklistItems), [checklistItems, flattenLeafViews]);

  const completionPercentage = useMemo(() => {
    const total = leafItems.length;
    const completed = leafItems.filter((item) => item.isChecked).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [leafItems]);

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Checklist</Typography>
        <Button startIcon={<Icon path={mdiCog} size={1} />} variant="contained">
          Configure
        </Button>
      </Box>

      <Box py={2} mt={2}>
        <LinearProgressWithLabel value={completionPercentage} />
      </Box>

      <Box width="300px" flexShrink={0}>
        <HierarchicalCustomToggleButtonGroup
          views={checklistItems}
          activeView={activeView}
          onViewChange={handleViewChange}
          orientation="vertical"
          handleCheckbox={(value) => {
            console.log('Checkbox clicked:', value);
          }}
        />
      </Box>
    </>
  );
};
