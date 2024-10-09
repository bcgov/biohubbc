import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface CustomToggleButtonGroupProps<T extends string> {
  views: Array<{ value: T; label: string; icon: string }>;
  activeView: T;
  onViewChange: (view: T) => void;
}

const CustomToggleButtonGroup = <T extends string>(props: CustomToggleButtonGroupProps<T>) => {
  const { views, activeView, onViewChange } = props;

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={activeView}
      onChange={(_, view) => {
        if (view) {
          onViewChange(view);
        }
      }}
      exclusive
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        gap: 1,
        '& Button': {
          py: 0.25,
          px: 2,
          border: 'none',
          borderRadius: '4px !important',
          fontSize: '0.875rem',
          fontWeight: 700,
          letterSpacing: '0.02rem',
          justifyContent: 'flex-start'
        }
      }}>
      {views.map((view) => (
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
  );
};

export default CustomToggleButtonGroup;
