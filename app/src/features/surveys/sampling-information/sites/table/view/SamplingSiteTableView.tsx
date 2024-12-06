import { mdiMapMarker, mdiShapePlus, mdiViewGridPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export enum SamplingSiteManageTableView {
  SITES = 'SITES',
  CLUSTER = 'CLUSTERS',
  // TODO: Add strata tab showing a table of strata in survey
  STRATA = 'STRATA'
}

interface ISamplingSiteManageTableView {
  value: SamplingSiteManageTableView;
  icon: React.ReactNode;
}

export type ISamplingSiteCount = Record<SamplingSiteManageTableView, number>;

interface ISamplingSiteTableViewProps {
  activeView: SamplingSiteManageTableView;
  setActiveView: (view: SamplingSiteManageTableView) => void;
}

/**
 * Renders tab controls for the sampling site table, which allow the user to switch between viewing sites and blocks.
 *
 * @param {ISamplingSiteTableViewProps} props
 * @return {*}
 */
export const SamplingSiteTableView = (props: ISamplingSiteTableViewProps) => {
  const { activeView, setActiveView } = props;

  const views: ISamplingSiteManageTableView[] = [
    { value: SamplingSiteManageTableView.SITES, icon: <Icon path={mdiMapMarker} size={0.75} /> },
    { value: SamplingSiteManageTableView.CLUSTER, icon: <Icon path={mdiViewGridPlus} size={0.75} /> },
    { value: SamplingSiteManageTableView.STRATA, icon: <Icon path={mdiShapePlus} size={0.75} /> }
  ];

  const updateDatasetView = (_: React.MouseEvent<HTMLElement>, view: SamplingSiteManageTableView) => {
    if (view) {
      setActiveView(view);
    }
  };

  return (
    <ToggleButtonGroup
      value={activeView}
      onChange={updateDatasetView}
      exclusive
      sx={{
        flex: '1 1 auto',
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
          {view.value}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
