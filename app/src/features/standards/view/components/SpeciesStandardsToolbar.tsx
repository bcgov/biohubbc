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

/**
 * Toolbar for handling what species standards information is displayed
 *
 * @return {*}
 */
const SpeciesStandardsToolbar = (props: ISpeciesStandardsToolbarProps) => {
  const updateDatasetView = (_event: React.MouseEvent<HTMLElement>, view: SpeciesStandardsViewEnum) => {
    if (!view) {
      return;
    }

    props.updateDatasetView(view);
  };

  return (
    <Box>
      <ToggleButtonGroup value={props.activeView} onChange={updateDatasetView} exclusive>
        {props.views.map((view) => (
          <>
            <ToggleButton
              key={view.value}
              component={Button}
              color="primary"
              startIcon={<Icon path={view.icon} size={0.75} />}
              value={view.value}>
              {view.label}
            </ToggleButton>
            <ToggleButton
              key={view.value}
              component={Button}
              color="primary"
              startIcon={<Icon path={view.icon} size={0.75} />}
              value={view.value}>
              {view.label}
            </ToggleButton>
          </>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default SpeciesStandardsToolbar;
