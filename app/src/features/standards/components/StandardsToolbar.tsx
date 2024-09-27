import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import React, { SetStateAction } from 'react';
import { IStandardsPageView, StandardsPageView } from '../StandardsPage';

interface IStandardsToolbar {
  views: IStandardsPageView[];
  currentView: StandardsPageView;
  setCurrentView: React.Dispatch<SetStateAction<StandardsPageView>>;
}

/**
 * Toolbar for setting the standards page view
 *
 * @param props
 * @returns
 */
export const StandardsToolbar = (props: IStandardsToolbar) => {
  const { views, currentView, setCurrentView } = props;

  return (
    <>
      <Typography component="legend">Data types</Typography>
      <ToggleButtonGroup
        orientation="vertical"
        value={currentView}
        onChange={(_event: React.MouseEvent<HTMLElement>, view: StandardsPageView | null) => {
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
