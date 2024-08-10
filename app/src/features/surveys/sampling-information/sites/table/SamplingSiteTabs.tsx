import { mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { SetStateAction } from 'react';

export enum SamplingSiteManageTableView {
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

interface ISamplingSiteManageTableView {
  value: SamplingSiteManageTableView;
  icon: React.ReactNode;
}

export type ISamplingSiteCount = Record<SamplingSiteManageTableView, number>;

interface ISamplingSiteTabsProps {
  activeView: SamplingSiteManageTableView;
  setActiveView: React.Dispatch<SetStateAction<SamplingSiteManageTableView>>;
  viewCounts: Record<SamplingSiteManageTableView, number>;
}

/**
 * Renders tab controls for the sampling site table, which allow the user to switch between viewing sites and periods.
 *
 * @param {ISamplingSiteTabsProps} props
 * @return {*}
 */
export const SamplingSiteTabs = (props: ISamplingSiteTabsProps) => {
  const { activeView, setActiveView, viewCounts } = props;

  const views: ISamplingSiteManageTableView[] = [
    { value: SamplingSiteManageTableView.SITES, icon: <Icon path={mdiMapMarker} size={0.75} /> },
    { value: SamplingSiteManageTableView.PERIODS, icon: <Icon path={mdiCalendarRange} size={0.75} /> }
  ];

  const activeViewCount = viewCounts[activeView];

  const updateDatasetView = (_: React.MouseEvent<HTMLElement>, view: SamplingSiteManageTableView) => {
    if (view) {
      setActiveView(view);
    }
  };

  return (
    <Toolbar>
      <ToggleButtonGroup
        value={activeView}
        onChange={updateDatasetView}
        exclusive
        sx={{
          display: 'flex',
          gap: 1,
          '& Button': {
            py: 0.5,
            px: 1.5,
            border: 'none',
            borderRadius: '4px !important',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.02rem'
          }
        }}>
        {views.map((view) => (
          <ToggleButton key={view.value} component={Button} color="primary" value={view.value} startIcon={view.icon}>
            {view.value}&nbsp;({activeViewCount})
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Toolbar>
  );
};
