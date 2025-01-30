import {
  mdiCardAccountMailOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiDatabaseRefreshOutline,
  mdiEye,
  mdiLifebuoy,
  mdiOfficeBuildingCogOutline,
  mdiPaw,
  mdiWall,
  mdiWifiMarker
} from '@mdi/js';
import { Box, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import PageHeader from 'components/layout/PageHeader';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useSearchParams } from 'hooks/useSearchParams';
import { SetStateAction } from 'react';
import { ISupportPageView, SupportPageParams, SupportPageView } from '../support/constants/SupportPageView';
import { dataMap } from '../support/data/dataMap';
import AccordionSupportCard from './components/AccordionSupportCard';

/**
 * Returns information about how to use the app, definitions, and other resources for users.
 *
 * @returns {*}
 */
const SupportPage = () => {
  const { searchParams, setSearchParams } = useSearchParams<SupportPageParams>();

  const currentViewParam = searchParams.get('support_view');
  const currentView = (currentViewParam as SupportPageView) || SupportPageView.GENERAL;

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL, icon: mdiLifebuoy },
    { label: 'SIMS Structure', value: SupportPageView.STRUCTURE, icon: mdiOfficeBuildingCogOutline },
    { label: 'Data Standards', value: SupportPageView.DATA_STANDARDS, icon: mdiDatabaseRefreshOutline },
    { label: 'Foundational Data', value: SupportPageView.FOUNDATION, icon: mdiWall },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS, icon: mdiEye },
    { label: 'Animals', value: SupportPageView.ANIMALS, icon: mdiPaw },
    { label: 'Telemetry', value: SupportPageView.TELEMETRY, icon: mdiWifiMarker },
    { label: 'Contact', value: SupportPageView.CONTACT, icon: mdiCardAccountMailOutline }
  ];

  const currentIndex = views.findIndex((view) => view.value === currentView);
  const nextView = views[(currentIndex + 1) % views.length];
  const prevView = views[(currentIndex - 1 + views.length) % views.length];

  const handleViewChange: React.Dispatch<SetStateAction<SupportPageView>> = (value) => {
    const newView = typeof value === 'function' ? value(currentView) : value;
    setSearchParams(searchParams.set('support_view', newView));
    window.scrollTo(0, 0);
  };

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3, height: '100%' }}>
          {/* Navigation Pane */}
          <Box width="300px" flexShrink={0}>
            <Typography variant="h4" gutterBottom>
              Support Overview
            </Typography>
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
              <Typography variant="h2" gutterBottom>
                {views.find((view) => view.value === currentView)?.label}
              </Typography>

              <Box
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: grey[300],
                  borderRadius: '8px',
                  bgcolor: grey[50]
                }}>
                <Stack gap={2}>
                  {dataMap[currentView]?.map((item, itemIndex) => (
                    <Box key={`${item.label}-${itemIndex}`}>
                      {item.description.map((chunk, chunkIndex) => (
                        <Box key={`${item.label}-${chunkIndex}`} sx={{ mb: 2 }}>
                          {chunk}
                        </Box>
                      ))}
                      {item.markdownType && (
                        <AccordionSupportCard label={item.label} colour={grey[100]} markdownType={item.markdownType} />
                      )}
                    </Box>
                  )) || <Typography>No content available for this section.</Typography>}
                </Stack>
              </Box>
            </Box>
            {/* Chevron Arrows */}
            {currentView !== SupportPageView.CONTACT && (
              <Stack
                direction="row"
                justifyContent={getJustifyContent(currentIndex, views.length)}
                alignItems="center"
                sx={{ mt: 'auto', pt: 2 }}>
                {currentIndex > 0 && (
                  <Box
                    component="button"
                    onClick={() => handleViewChange(prevView.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: grey[700],
                      '&:hover': { color: grey[900] }
                    }}>
                    <svg style={{ width: 24, height: 24, marginRight: 8 }}>
                      <path d={mdiChevronLeft} fill="currentColor" />
                    </svg>
                    <Typography>Previous Topic</Typography>
                  </Box>
                )}
                {currentIndex < views.length - 1 && (
                  <Box
                    component="button"
                    onClick={() => handleViewChange(nextView.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: grey[700],
                      '&:hover': { color: grey[900] }
                    }}>
                    <Typography>Next Topic</Typography>
                    <svg style={{ width: 24, height: 24, marginLeft: 8 }}>
                      <path d={mdiChevronRight} fill="currentColor" />
                    </svg>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

const getJustifyContent = (currentIndex: number, viewsLength: number) => {
  if (currentIndex === 0) {
    return 'flex-end';
  } else if (currentIndex === viewsLength - 1) {
    return 'flex-start';
  } else {
    return 'space-between';
  }
};

export default SupportPage;
