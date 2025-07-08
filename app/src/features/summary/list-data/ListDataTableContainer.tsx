import { mdiClipboardOutline, mdiDatabaseSearch, mdiFormatListGroup, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import SurveysListContainer from 'features/summary/list-data/survey/SurveysListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useState } from 'react';
import { TabularDataTableContainer } from '../tabular-data/TabularDataTableContainer';
import { CollectionListContainer } from './collection/CollectionListContainer';
import { CreateCollectionButton } from './collection/create/CreateCollectionButton';
import { CreateSurveyButton } from './survey/create/CreateSurveyButton';

export const SUMMARY_ACTIVE_VIEW_KEY = 'lvk';
export enum SUMMARY_ACTIVE_VIEW_VALUE {
  surveys = 'surveys',
  collections = 'projects',
  data = 'data'
}

const SHOW_SEARCH_KEY = 'lvsk';
enum SHOW_SEARCH_VALUE {
  true = 'true',
  false = 'false'
}

// Supported URL parameters
type ListDataTableURLParams = {
  [SUMMARY_ACTIVE_VIEW_KEY]: SUMMARY_ACTIVE_VIEW_VALUE;
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
    (searchParams.get(SUMMARY_ACTIVE_VIEW_KEY) as SUMMARY_ACTIVE_VIEW_VALUE | null) ?? SUMMARY_ACTIVE_VIEW_VALUE.surveys
  );
  const [showSearch, setShowSearch] = useState<boolean>(searchParams.get(SHOW_SEARCH_KEY) === SHOW_SEARCH_VALUE.true);

  const views = [
    {
      value: SUMMARY_ACTIVE_VIEW_VALUE.surveys,
      label: 'Surveys',
      icon: mdiClipboardOutline,
      button: <CreateSurveyButton />
    },
    {
      value: SUMMARY_ACTIVE_VIEW_VALUE.collections,
      label: 'Projects',
      icon: mdiFormatListGroup,
      button: <CreateCollectionButton />
    },
    { value: SUMMARY_ACTIVE_VIEW_VALUE.data, label: 'Data', icon: mdiDatabaseSearch }
  ];

  const activeViewObj = views.find((v) => v.value === activeView);

  return (
    <SidebarLayout
      sidebar={
        <Box p={2} sx={{ minWidth: '250px', overflowY: 'auto', height: '100%', flexShrink: 0 }}>
          <CustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={(view) => {
              console.log(view);
              setSearchParams(searchParams.set(SUMMARY_ACTIVE_VIEW_KEY, view, { replace: true }));
              setActiveView(view);
            }}
            orientation="vertical"
          />
        </Box>
      }
      header={
        <>
          <Stack gap={1} direction="row" alignItems="center">
            <Typography variant="h2">{activeViewObj?.label}</Typography>
          </Stack>
          <Stack gap={2} direction="row">
            <Button
              color="primary"
              sx={{ fontWeight: 700 }}
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
      {activeView === SUMMARY_ACTIVE_VIEW_VALUE.surveys && <SurveysListContainer showSearch={showSearch} />}
      {activeView === SUMMARY_ACTIVE_VIEW_VALUE.collections && <CollectionListContainer showSearch={showSearch} />}
      {activeView === SUMMARY_ACTIVE_VIEW_VALUE.data && <TabularDataTableContainer />}
    </SidebarLayout>
  );
};
