import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
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
      <ToggleButtonGroup
        orientation="vertical"
        value={currentView}
        onChange={(_event: React.MouseEvent<HTMLElement>, view: StandardsPageView) => setCurrentView(view)}
        exclusive
        sx={{
          minWidth: '200px',
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
            textAlign: 'left'
          }
        }}>
        {views.map((view) => (
          <ToggleButton key={view.value} value={view.value} color="primary" sx={{ textAlign: 'left' }}>
            {view.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};
