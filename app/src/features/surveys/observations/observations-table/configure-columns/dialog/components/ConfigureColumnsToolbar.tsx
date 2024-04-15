import Icon from '@mdi/react';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ConfigureColumnsViewEnum } from '../../ConfigureColumnsContainer';

interface IConfigureColumnsView {
  label: string;
  icon: string;
  value: ConfigureColumnsViewEnum;
  isLoading: boolean;
}

interface IConfigureColumnsToolbarProps {
  activeView: ConfigureColumnsViewEnum;
  updateActiveView: (view: ConfigureColumnsViewEnum) => void;
  views: IConfigureColumnsView[];
}

const ConfigureColumnsToolbar = (props: IConfigureColumnsToolbarProps) => {
  const updateActiveView = (_event: React.MouseEvent<HTMLElement>, view: ConfigureColumnsViewEnum) => {
    if (!view) {
      return;
    }

    props.updateActiveView(view);
  };

  return (
    <>
      <ToggleButtonGroup
        value={props.activeView}
        onChange={updateActiveView}
        exclusive
        orientation="vertical"
        sx={{
          width: '100%',
          gap: 1,
          '& Button': {
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'flex-start',
            py: 1,
            px: 2,
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
    </>
  );
};

export default ConfigureColumnsToolbar;
