import Icon from '@mdi/react';
import { Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

export interface IToggleButtonView<T> {
  label: string;
  icon: string;
  value: T;
  isLoading?: boolean;
  count?: number;
}

interface IToggleButtonToolbarProps<T> {
  updateDatasetView: (view: T) => void;
  views: IToggleButtonView<T>[];
  activeView: T;
}

/**
 * Toolbar for switching between tabs
 *
 * @return {JSX.Element}
 */
const ToggleButtonToolbar = <T,>(props: IToggleButtonToolbarProps<T>) => {
  const updateDatasetView = (_event: React.MouseEvent<HTMLElement>, view: T) => {
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
            key={view.value as string} // Ensure key is a string
            component={Button}
            color="primary"
            startIcon={<Icon path={view.icon} size={0.75} />}
            value={view.value as string} // Ensure value is a string
          >
            {view.label}
            {view.count !== undefined && <>&nbsp;({view.count})</>}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default ToggleButtonToolbar;
