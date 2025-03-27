import { mdiFolder, mdiListBoxOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import ProjectsListContainer from 'features/summary/list-data/project/ProjectsListContainer';
import SurveysListContainer from 'features/summary/list-data/survey/SurveysListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';

export const ACTIVE_VIEW_KEY = 'lvk';
export enum ACTIVE_VIEW_VALUE {
  projects = 'pv',
  surveys = 'sv'
}

export const SHOW_SEARCH_KEY = 'lvsk';
enum SHOW_SEARCH_VALUE {
  true = 'true',
  false = 'false'
}

// Supported URL parameters
type ListDataTableURLParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
  [SHOW_SEARCH_KEY]: SHOW_SEARCH_VALUE;
};

/**
 * Data table component for list data (ie: projects, surveys).
 *
 * @return {*}
 */
export const ListDataTableContainer = () => {
  const { searchParams, setSearchParams } = useSearchParams<ListDataTableURLParams>();

  const [activeView, setActiveView] = useState(
    (searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE | null) ?? ACTIVE_VIEW_VALUE.projects
  );
  const [showSearch, setShowSearch] = useState<boolean>(searchParams.get(SHOW_SEARCH_KEY) === SHOW_SEARCH_VALUE.true);

  const views = [
    { value: ACTIVE_VIEW_VALUE.projects, label: 'projects', icon: mdiFolder },
    { value: ACTIVE_VIEW_VALUE.surveys, label: 'surveys', icon: mdiListBoxOutline }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => {
            setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, view));
            setActiveView(view);
          }}
          orientation="horizontal"
        />
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.PROJECTS_AND_SURVEYS} />
          <Button
            color="primary"
            variant="outlined"
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
        </Stack>
      </Toolbar>
      <Divider />
      {activeView === ACTIVE_VIEW_VALUE.projects && <ProjectsListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.surveys && <SurveysListContainer showSearch={showSearch} />}
    </>
  );
};
