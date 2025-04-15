import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { HierarchicalCustomToggleButtonGroup } from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { ACTIVE_VIEW_VALUE } from '../view/SurveyPage';
import { LinearProgressWithLabel } from './progress/SurveyChecklistProgressBar';

interface SurveyChecklistProps {
  activeView: ACTIVE_VIEW_VALUE;
  handleViewChange: (view: ACTIVE_VIEW_VALUE) => void;
}

export const SurveyChecklist = (props: SurveyChecklistProps) => {
  const { activeView, handleViewChange } = props;

  const biohubApi = useBiohubApi();
  const checklistDataLoader = useDataLoader(() => biohubApi.survey.findSurveys());

  useEffect(() => {
    checklistDataLoader.load();
  }, [checklistDataLoader]);

  const ChecklistItems = [
    {
      value: ACTIVE_VIEW_VALUE.sampling,
      label: 'Sampling',
      checkbox: true,
      isHeading: true,
      tooltip: 'Add information about where, when, and how you collected data',
      children: [
        {
          value: ACTIVE_VIEW_VALUE.sites,
          label: 'Sites',
          checkbox: true,
          tooltip: 'Add sampling sites showing where you collected data'
        },
        {
          value: ACTIVE_VIEW_VALUE.techniques,
          label: 'Techniques',
          checkbox: true,
          tooltip: 'Add methods describing how you collected data'
        },
        {
          value: ACTIVE_VIEW_VALUE.periods,
          label: 'Periods',
          checkbox: true,
          tooltip: 'Add time periods describing when you did a sampling method at a site'
        }
      ]
    },
    {
      value: ACTIVE_VIEW_VALUE.data,
      label: 'Data',
      checkbox: true,
      isHeading: true,
      tooltip: 'Add data that you collected',
      children: [
        {
          value: ACTIVE_VIEW_VALUE.observations,
          label: 'Observations',
          checkbox: true,
          tooltip: 'Add observations of species'
        },
        { value: ACTIVE_VIEW_VALUE.telemetry, label: 'Telemetry', checkbox: true, tooltip: 'Add telemetry data' },
        {
          value: ACTIVE_VIEW_VALUE.animals,
          label: 'Animals',
          checkbox: true,
          tooltip: 'Add individual animals that you captured or marked'
        },
        {
          value: ACTIVE_VIEW_VALUE.habitat,
          label: 'Habitat Features',
          checkbox: true,
          tooltip: 'Add observations of habitat features like nests or dens'
        }
      ]
    },
    {
      value: ACTIVE_VIEW_VALUE.attachments,
      label: 'Attachments',
      checkbox: true,
      tooltip: 'Add supplementary files'
    },
    {
      value: ACTIVE_VIEW_VALUE.metadata,
      label: 'Metadata',
      checkbox: true,
      tooltip: 'Add general context about the survey'
    }
  ];

  return (
    <Paper sx={{ p: 3, pt: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Checklist</Typography>
        <Button startIcon={<Icon path={mdiCog} size={1} />} variant="contained">
          Configure
        </Button>
      </Box>
      <Box py={3} mt={1}>
        <LinearProgressWithLabel value={50} />
      </Box>
      <Box width="300px" flexShrink={0}>
        <HierarchicalCustomToggleButtonGroup
          views={ChecklistItems}
          activeView={activeView}
          onViewChange={handleViewChange}
          orientation="vertical"
          handleCheckbox={(value) => {
            console.log(value);
          }}
        />
      </Box>
    </Paper>
  );
};
