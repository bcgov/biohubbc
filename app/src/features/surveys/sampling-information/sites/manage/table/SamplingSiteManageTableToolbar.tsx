import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { SetStateAction } from 'react';

export enum SamplingSiteManageTableView {
  SITES = 'SITES',
  TECHNIQUES = 'TECHNIQUES',
  PERIODS = 'PERIODS'
}

interface ISamplingSiteManageTableView {
  value: SamplingSiteManageTableView;
  label: string;
}

export interface ISamplingSiteCount {
  type: SamplingSiteManageTableView;
  value: number;
}

interface ISamplingSiteManageTableToolbarProps {
  activeView: SamplingSiteManageTableView;
  setActiveView: React.Dispatch<SetStateAction<SamplingSiteManageTableView>>;
  counts: ISamplingSiteCount[];
}

export const SamplingSiteManageTableToolbar = (props: ISamplingSiteManageTableToolbarProps) => {
  const { activeView, setActiveView, counts } = props;

  const views: ISamplingSiteManageTableView[] = [
    { value: SamplingSiteManageTableView.SITES, label: 'Sites' },
    { value: SamplingSiteManageTableView.TECHNIQUES, label: 'Techniques' },
    { value: SamplingSiteManageTableView.PERIODS, label: 'Periods' }
  ];

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
          <ToggleButton key={view.value} component={Button} color="primary" value={view.value}>
            {view.label}&nbsp;({counts.find((count) => count.type === view.value)?.value ?? 0})
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Toolbar>
  );
};
