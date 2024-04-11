import Icon from '@mdi/react';
import { Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

export enum SpeciesStandardsViewEnum {
  MEASUREMENTS = 'MEASUREMENTS',
  MARKING_BODY_LOCATIONS = 'MARKING BODY LOCATIONS'
}

interface ISurveySpatialDatasetView {
  label: string;
  icon: string;
  value: SpeciesStandardsViewEnum;
  isLoading: boolean;
}

interface ISpeciesStandardsToolbarProps {
  updateDatasetView: (view: SpeciesStandardsViewEnum) => void;
  views: ISurveySpatialDatasetView[];
  activeView: SpeciesStandardsViewEnum;
}

const SpeciesStandardsToolbar = (props: ISpeciesStandardsToolbarProps) => {
  const updateDatasetView = (_event: React.MouseEvent<HTMLElement>, view: SpeciesStandardsViewEnum) => {
    if (!view) {
      return;
    }

    props.updateDatasetView(view);
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={props.activeView}
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
        {props.views.map((view) => (
          <ToggleButton
            key={view.value}
            component={Button}
            color="primary"
            startIcon={<Icon path={view.icon} size={0.75} />}
            value={view.value}>
            {view.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default SpeciesStandardsToolbar;
