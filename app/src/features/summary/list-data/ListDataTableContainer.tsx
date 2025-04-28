import { mdiClipboardOutline, mdiDatabaseSearch, mdiFormatListGroup, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import SurveysListContainer from 'features/summary/list-data/survey/SurveysListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useState } from 'react';
import { TabularDataTableContainer } from '../tabular-data/TabularDataTableContainer';
import CollectionsListContainer from './collection/CollectionListContainer';
import { CreateCollectionButton } from './collection/create/CreateCollectionButton';
import { CreateSurveyButton } from './survey/create/CreateSurveyButton';

const ACTIVE_VIEW_KEY = 'lvk';
export enum ACTIVE_VIEW_VALUE {
  surveys = 'surveys',
  collections = 'collections',
  data = 'data'
}

const SHOW_SEARCH_KEY = 'lvsk';
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
 * Data table component for list data (ie: surveys).
 *
 * @return {*}
 */
export const ListDataTableContainer = () => {
  const { searchParams, setSearchParams } = useSearchParams<ListDataTableURLParams>();

  const [activeView, setActiveView] = useState(
    (searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE | null) ?? ACTIVE_VIEW_VALUE.surveys
  );
  const [showSearch, setShowSearch] = useState<boolean>(searchParams.get(SHOW_SEARCH_KEY) === SHOW_SEARCH_VALUE.true);

  const views = [
    {
      value: ACTIVE_VIEW_VALUE.surveys,
      label: 'Surveys',
      icon: mdiClipboardOutline,
      button: <CreateSurveyButton />
    },
    {
      value: ACTIVE_VIEW_VALUE.collections,
      label: 'Collections',
      icon: mdiFormatListGroup,
      button: <CreateCollectionButton />
    },
    { value: ACTIVE_VIEW_VALUE.data, label: 'Data', icon: mdiDatabaseSearch }
  ];

  const activeViewObj = views.find((v) => v.value === activeView);

  return (
    <SidebarLayout
      sidebar={
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => {
            setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, view));
            setActiveView(view);
          }}
          orientation="vertical"
        />
      }
      header={
        <>
          <Typography variant="h2">{activeViewObj?.label}</Typography>
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
              startIcon={<Icon path={mdiMagnify} size={1} />}>
              Search
            </Button>
            {activeViewObj?.button}
          </Stack>
        </>
      }>
      {activeView === ACTIVE_VIEW_VALUE.surveys && <SurveysListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.collections && <CollectionsListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.data && <TabularDataTableContainer />}
    </SidebarLayout>
  );
};
