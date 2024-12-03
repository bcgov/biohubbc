import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import React, { SetStateAction } from 'react';

interface IStandardsToolbar<T> {
  views: { label: string; value: T; icon: string }[];
  currentView: T;
  setCurrentView: React.Dispatch<SetStateAction<T>>;
  legend?: string;
}

/**
 * Generic Toolbar for setting the page view
 *
 * @param props
 * @returns
 */
export const StandardsToolbar = function <T extends string>(props: IStandardsToolbar<T>) {
  const { views, currentView, setCurrentView, legend = 'Data types' } = props;

  return (
    <>
      {legend && <Typography component="legend">{legend}</Typography>}
      <ToggleButtonGroup
        orientation="vertical"
        value={currentView}
        onChange={(_event: React.MouseEvent<HTMLElement>, view: T | null) => {
          if (view) {
            setCurrentView(view);
          }
        }}
        exclusive
        sx={{
          display: 'flex',
          gap: 1,
          '& Button': {
            py: 1.25,
            px: 2.5,
            border: 'none',
            borderRadius: '4px !important',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.02rem',
            textAlign: 'left',
            justifyContent: 'flex-start'
          }
        }}>
        {views.map((view) => (
          <ToggleButton
            component={Button}
            startIcon={<Icon path={view.icon} size={1} />}
            key={view.value}
            value={view.value}
            color="primary">
            {view.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};

export default StandardsToolbar;
