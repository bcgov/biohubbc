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

export const LIST_VIEW_PARAM_KEY = 'lvk';
export enum LIST_VIEW_PARAM_VALUE {
  projects = 'pv',
  surveys = 'sv'
}

export const LIST_VIEW_SEARCH_PARAM_KEY = 'lvsk';
export enum LIST_VIEW_SEARCH_PARAM_VALUE {
  showFilters = 'ss'
}

type ListDataTableURLParams = {
  [LIST_VIEW_PARAM_KEY]: LIST_VIEW_PARAM_VALUE;
  [LIST_VIEW_SEARCH_PARAM_KEY]: LIST_VIEW_SEARCH_PARAM_VALUE;
};

const buttonSx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

export const ListDataTableContainer = () => {
  const { urlParams, setURLParams } = useSearchParams<ListDataTableURLParams>();

  const activeView = urlParams.get(LIST_VIEW_PARAM_KEY) ?? LIST_VIEW_PARAM_VALUE.projects;
  const showSearch = !!urlParams.get(LIST_VIEW_SEARCH_PARAM_KEY) ?? false;

  const views = [
    { value: LIST_VIEW_PARAM_VALUE.projects, label: 'projects', icon: mdiFolder },
    { value: LIST_VIEW_PARAM_VALUE.surveys, label: 'surveys', icon: mdiListBoxOutline }
  ];

  const onChangeView = (_: React.MouseEvent<HTMLElement>, value: LIST_VIEW_PARAM_VALUE) => {
    if (!value) {
      return;
    }

    setURLParams(urlParams.set(LIST_VIEW_PARAM_KEY, value));
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
            '& Button': buttonSx
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
            setURLParams(
              (showSearch && urlParams.delete(LIST_VIEW_SEARCH_PARAM_KEY)) ||
                urlParams.set(LIST_VIEW_SEARCH_PARAM_KEY, LIST_VIEW_SEARCH_PARAM_VALUE.showFilters)
            );
          }}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          Search
        </Button>
      </Toolbar>
      <Divider />
      {activeView === LIST_VIEW_PARAM_VALUE.projects && <ProjectsListContainer showSearch={showSearch} />}
      {activeView === LIST_VIEW_PARAM_VALUE.surveys && <SurveysListContainer showSearch={showSearch} />}
    </>
  );
};
