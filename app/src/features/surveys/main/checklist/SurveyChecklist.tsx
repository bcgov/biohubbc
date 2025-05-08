import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  HierarchicalCustomToggleButtonGroup,
  ToggleButtonView
} from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { IGetSurveyChecklist } from 'interfaces/useSurveyApi.interface';
import { useMemo } from 'react';
import { ACTIVE_VIEW_VALUE } from '../SurveyPage';

interface SurveyChecklistProps {
  checklist: IGetSurveyChecklist;
  activeView: ACTIVE_VIEW_VALUE | null;
  handleViewChange: (view: ACTIVE_VIEW_VALUE) => void;
}

export const SurveyChecklist = (props: SurveyChecklistProps) => {
  const { checklist, activeView, handleViewChange } = props;
  const checklistItems = useMemo((): ToggleButtonView<ACTIVE_VIEW_VALUE>[] => {
    if (!checklist) {
      return [];
    }

    // Define the sections and the items within each
    const sections = [
      {
        label: 'Sampling',
        items: [
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
        label: 'Data',
        items: [
          {
            value: ACTIVE_VIEW_VALUE.observations,
            label: 'Observations',
            isChecked: !!checklist.data?.observations,
            checkbox: true,
            tooltip: 'Add observations of species'
          },
          {
            value: ACTIVE_VIEW_VALUE.animals,
            label: 'Animals',
            isChecked: !!checklist.data?.animals,
            checkbox: true,
            tooltip: 'Add individual animals that you captured or marked'
          },
          {
            value: ACTIVE_VIEW_VALUE.telemetry,
            label: 'Telemetry',
            isChecked:
              !!checklist.data?.telemetry?.devices &&
              !!checklist.data?.telemetry?.deployments &&
              !!checklist.data?.telemetry?.locations,
            checkbox: true,
            isHeader: true,
            children: [
              {
                value: ACTIVE_VIEW_VALUE.devices,
                label: 'Devices',
                isChecked: !!checklist.data?.telemetry?.devices,
                checkbox: true,
                tooltip: 'Add telemetry data'
              },
              {
                value: ACTIVE_VIEW_VALUE.deployments,
                label: 'Deployments',
                isChecked: !!checklist.data?.telemetry?.deployments,
                checkbox: true,
                tooltip: 'Add telemetry data'
              },
              {
                value: ACTIVE_VIEW_VALUE.locations,
                label: 'Locations',
                isChecked: !!checklist.data?.telemetry?.locations,
                checkbox: true,
                tooltip: 'Add telemetry data'
              }
            ]
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
        label: 'Supplementary',
        items: [
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

    // Flatten the sections and ensure children are included immediately after their parent
    return sections.flatMap((section) => [
      // Header (non-interactive) for each section
      {
        value: `${section.label.toLowerCase().replace(/\s+/g, '_')}` as ACTIVE_VIEW_VALUE,
        label: section.label,
        isHeader: true
      },
      // Flatten items and children under their respective parents
      ...section.items
    ]);
  }, [checklist]);

  return (
    <Box flexShrink={0} height="100%">
      <HierarchicalCustomToggleButtonGroup
        views={checklistItems}
        activeView={activeView}
        onViewChange={handleViewChange}
        orientation="vertical"
      />
      <Button fullWidth variant="contained" sx={{ mt: 3 }}>
        Publish
      </Button>
    </Box>
  );
};
