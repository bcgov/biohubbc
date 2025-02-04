import {
  mdiAccountSupervisor,
  mdiAutoFix,
  mdiCardAccountMailOutline,
  mdiCheckDecagram,
  mdiChevronLeft,
  mdiChevronRight,
  mdiDatabaseCog,
  mdiEye,
  mdiFileOutline,
  mdiFolder,
  mdiHome,
  mdiInformationOutline,
  mdiListBoxOutline,
  mdiPaw,
  mdiPineTreeVariant,
  mdiWifiMarker
} from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import AutocompleteSearchField from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import PageHeader from 'components/layout/PageHeader';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useSearchParams } from 'hooks/useSearchParams';
import { ReactNode, SetStateAction } from 'react';
import { ISupportPageView, SupportPageParams, SupportPageView } from '../support/constants/SupportPageView';
import { SupportOverview } from './content/overview/SupportOverview';
import { SupportProjects } from './content/projects/SupportProjects';
import { SupportObservations } from './content/projects/surveys/data/observations/SupportObservations';
import { SupportData } from './content/projects/surveys/data/SupportData';
import { SupportTelemetry } from './content/projects/surveys/data/telemetry/SupportTelemetry';
import { SupportSampling } from './content/projects/surveys/sampling/SupportSampling';
import { SupportSurveys } from './content/projects/surveys/SupportSurveys';
import { SupportTeam } from './content/projects/team/SupportTeam';

/**
 * Returns information about how to use the app, definitions, and other resources for users.
 *
 * @returns {*}
 */
export const SupportPage = () => {
  const { searchParams, setSearchParams } = useSearchParams<SupportPageParams>();

  const currentViewParam = searchParams.get('support_view');
  const currentView = (currentViewParam as SupportPageView) || SupportPageView.GENERAL;

  // Add nested structure
  const views: ISupportPageView[] = [
    {
      label: 'Overview',
      value: SupportPageView.GENERAL,
      icon: mdiHome,
      children: []
    },
    {
      label: 'Projects',
      value: SupportPageView.PROJECTS,
      icon: mdiFolder,
      children: [
        {
          label: 'Team',
          value: SupportPageView.PROJECT_TEAM,
          icon: mdiAccountSupervisor,
          children: []
        },
        {
          label: 'Surveys',
          value: SupportPageView.SURVEYS,
          icon: mdiListBoxOutline,
          children: [
            {
              label: 'Sampling',
              value: SupportPageView.SAMPLING,
              icon: mdiAutoFix,
              children: []
            },
            {
              label: 'Data',
              value: SupportPageView.DATA,
              icon: mdiDatabaseCog,
              children: [
                {
                  label: 'Observations',
                  value: SupportPageView.OBSERVATIONS,
                  icon: mdiEye,
                  children: []
                },
                {
                  label: 'Telemetry',
                  value: SupportPageView.TELEMETRY,
                  icon: mdiWifiMarker,
                  children: []
                },
                {
                  label: 'Animals',
                  value: SupportPageView.ANIMALS,
                  icon: mdiPaw,
                  children: []
                },
                {
                  label: 'Habitat Features',
                  value: SupportPageView.HABITAT,
                  icon: mdiPineTreeVariant,
                  children: []
                }
              ]
            },
            {
              label: 'Attachments',
              value: SupportPageView.FILES,
              icon: mdiFileOutline,
              children: []
            },
            {
              label: 'Metadata',
              value: SupportPageView.METADATA,
              icon: mdiInformationOutline,
              children: []
            }
          ]
        }
      ]
    },
    {
      label: 'Standards',
      value: SupportPageView.DATA_STANDARDS,
      icon: mdiCheckDecagram,
      children: []
    },
    {
      label: 'Contact',
      value: SupportPageView.CONTACT,
      icon: mdiCardAccountMailOutline,
      children: []
    }
  ];

  // Finding the current view and navigating to the correct parent/child
  const findView = (value: SupportPageView, views: ISupportPageView[]): ISupportPageView | null => {
    for (const view of views) {
      if (view.value === value) {
        return view;
      }
      if (view.children.length > 0) {
        const foundChild = findView(value, view.children);
        if (foundChild) return foundChild;
      }
    }
    return null;
  };

  const currentViewData = findView(currentView, views);
  const currentIndex = views.findIndex((view) => view.value === currentView);
  const nextView = views[(currentIndex + 1) % views.length];
  const prevView = views[(currentIndex - 1 + views.length) % views.length];

  const handleViewChange: React.Dispatch<SetStateAction<SupportPageView>> = (value) => {
    const newView = typeof value === 'function' ? value(currentView) : value;
    setSearchParams(searchParams.set('support_view', newView));
    window.scrollTo(0, 0);
  };

  const dataMap: Partial<Record<SupportPageView, ReactNode>> = {
    [SupportPageView.GENERAL]: <SupportOverview />,
    [SupportPageView.PROJECTS]: <SupportProjects />,
    [SupportPageView.PROJECT_TEAM]: <SupportTeam />,
    [SupportPageView.SURVEYS]: <SupportSurveys />,
    [SupportPageView.SAMPLING]: <SupportSampling />,
    [SupportPageView.OBSERVATIONS]: <SupportObservations />,
    [SupportPageView.TELEMETRY]: <SupportTelemetry />,
    [SupportPageView.DATA]: <SupportData />
  };

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <AutocompleteSearchField
          onSelect={() => {}}
          onSearch={() => new Promise(() => 'a')}
          fieldName=""
          getOptionLabel={() => ''}
          label="Search"
        />
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3, mt: 3, height: '100%' }}>
          {/* Navigation Pane */}
          <Box width="300px" flexShrink={0}>
            <CustomToggleButtonGroup
              views={views}
              activeView={currentView}
              onViewChange={handleViewChange}
              orientation={'vertical'}
            />
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Main Content Area */}
          <Stack direction="column" flex="1 1 auto" sx={{ height: '100%' }}>
            {/* Content */}
            <Box flex="1 1 auto">
              <Typography variant="h2" gutterBottom mb={3}>
                {currentViewData?.label}
              </Typography>

              <Stack gap={2}>{dataMap[currentView]}</Stack>
            </Box>

            {/* Chevron Arrows */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={
                currentIndex === 0 ? 'flex-end' : currentIndex === views.length - 1 ? 'flex-start' : 'space-between'
              }
              sx={{ width: '100%', '& .MuiButton-root': { fontWeight: 700 } }}>
              {currentIndex > 0 && (
                <Button
                  onClick={() => handleViewChange(prevView.value)}
                  startIcon={<Icon path={mdiChevronLeft} size={1} />}>
                  Previous
                </Button>
              )}
              {currentIndex < views.length - 1 && (
                <Button
                  onClick={() => handleViewChange(nextView.value)}
                  endIcon={<Icon path={mdiChevronRight} size={1} />}>
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
