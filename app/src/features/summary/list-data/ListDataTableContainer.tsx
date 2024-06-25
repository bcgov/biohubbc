import { mdiFolder, mdiListBoxOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import ProjectsListContainer from 'features/summary/list-data/project/ProjectsListContainer';
import SurveysListContainer from 'features/summary/list-data/survey/SurveysListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { useState } from 'react';

export const ACTIVE_VIEW_KEY = 'lvk';
export enum ACTIVE_VIEW_VALUE {
  projects = 'pv',
  surveys = 'sv'
}

export const SHOW_SEARCH_KEY = 'lvsk';
export enum SHOW_SEARCH_VALUE {
  true = 'true',
  false = 'false'
}

// Supported URL parameters
type ListDataTableURLParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
  [SHOW_SEARCH_KEY]: SHOW_SEARCH_VALUE;
};

const buttonSx = {
  py: 0.5,
  px: 1.5,
  border: 'none !important',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

/**
 * Data table component for list data (ie: projects, surveys).
 *
 * @return {*}
 */
export const ListDataTableContainer = () => {
  const { searchParams, setSearchParams } = useSearchParams<ListDataTableURLParams>();

  const [activeView, setActiveView] = useState(searchParams.get(ACTIVE_VIEW_KEY) ?? ACTIVE_VIEW_VALUE.projects);
  const [showSearch, setShowSearch] = useState<boolean>(searchParams.get(SHOW_SEARCH_KEY) === SHOW_SEARCH_VALUE.true);

  const views = [
    { value: ACTIVE_VIEW_VALUE.projects, label: 'projects', icon: mdiFolder },
    { value: ACTIVE_VIEW_VALUE.surveys, label: 'surveys', icon: mdiListBoxOutline }
  ];

  const onChangeView = (_: React.MouseEvent<HTMLElement>, value: ACTIVE_VIEW_VALUE) => {
    if (!value) {
      // User has clicked the active view, do nothing
      return;
    }

    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, value));
    setActiveView(value);
  };

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={activeView}
          onChange={onChangeView}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& .MuiButton-root': buttonSx
          }}>
          {views.map((view) => (
            <ToggleButton
              key={view.label}
              component={Button}
              color="primary"
              startIcon={<Icon path={view.icon} size={0.75} />}
              value={view.value}>
              {view.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button
          color="primary"
          sx={buttonSx}
          onClick={() => {
            setSearchParams(
              searchParams.set(SHOW_SEARCH_KEY, showSearch ? SHOW_SEARCH_VALUE.false : SHOW_SEARCH_VALUE.true)
            );
            setShowSearch(!showSearch);
          }}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          Search
        </Button>
      </Toolbar>
      <Divider />
      {activeView === ACTIVE_VIEW_VALUE.projects && <ProjectsListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.surveys && <SurveysListContainer showSearch={showSearch} />}
    </>
  );
};
