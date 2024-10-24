import { mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { SurveySamplingView } from '../../SurveySamplingTableContainer';

interface SurveySamplingViewTabsProps {
  activeView: SurveySamplingView;
  setActiveView: (view: SurveySamplingView) => void;
}

export const SurveySamplingViewTabs = ({ activeView, setActiveView }: SurveySamplingViewTabsProps) => {
  return (
    <Box p={2} display="flex" flexDirection="row" justifyContent="space-between">
      <ToggleButtonGroup
        value={activeView}
        onChange={(_, view) => {
          if (!view) {
            // An active view must be selected at all times
            return;
          }

          setActiveView(view);
        }}
        exclusive
        sx={{
          display: 'flex',
          gap: 1,
          '& Button': {
            py: 0.25,
            px: 1.5,
            border: 'none',
            borderRadius: '4px !important',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.02rem'
          }
        }}>
        <ToggleButton
          key="sampling-techniques-view"
          component={Button}
          color="primary"
          startIcon={<Icon path={mdiAutoFix} size={0.75} />}
          value={SurveySamplingView.TECHNIQUES}>
          Techniques
        </ToggleButton>
        <ToggleButton
          key="sampling-sites-view"
          component={Button}
          color="primary"
          startIcon={<Icon path={mdiMapMarker} size={0.75} />}
          value={SurveySamplingView.SITES}>
          Sites
        </ToggleButton>
        <ToggleButton
          key="sampling-periods-view"
          component={Button}
          color="primary"
          startIcon={<Icon path={mdiCalendarRange} size={0.75} />}
          value={SurveySamplingView.PERIODS}>
          Periods
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
