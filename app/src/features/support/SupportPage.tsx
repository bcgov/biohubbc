import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import PageHeader from 'components/layout/PageHeader';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useSearchParams } from 'hooks/useSearchParams';
import { useMemo, useState } from 'react';
import {
  ISupportPageView,
  SupportPageParams,
  SupportPageView,
  SupportPageViewMap,
  SupportPageViews
} from './SupportPageView';

const VIEW_KEY = 'v';

/**
 * Returns information about how to use the app, definitions, and other resources for users.
 *
 * @returns {*}
 */
export const SupportPage = () => {
  const { searchParams, setSearchParams } = useSearchParams<SupportPageParams>();

  // Initialize activeView based on the URL params
  const [activeView, setActiveView] = useState(
    (searchParams.get(VIEW_KEY) as SupportPageView) ?? SupportPageView.overview
  );

  const handleViewChange = (view: SupportPageView) => {
    if (view) {
      setActiveView(view);
      setSearchParams(searchParams.set(VIEW_KEY, view));
    }
  };

  // Recursively flattens child views
  const flattenViews = (views: ISupportPageView[]): ISupportPageView[] => {
    return views.flatMap((view) => [view, ...flattenViews(view.children ?? [])]);
  };

  // Find the current view object for its label, icon, children
  const currentView = useMemo(
    () => flattenViews(SupportPageViews).find((view) => view.value === activeView),
    [activeView]
  );

  // Sort views based on the order field
  const orderedViews = useMemo(
    () => SupportPageViews.flatMap((view) => [view, ...view.children]).sort((a, b) => a.order - b.order),
    []
  );

  const currentIndex = currentView ? orderedViews.findIndex((v) => v.value === currentView.value) : 0;
  const prevView = orderedViews[currentIndex - 1] || null;
  const nextView = orderedViews[currentIndex + 1] || null;

  // Get the JSX content to display for the activeView
  const children = SupportPageViewMap[activeView];

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3, mt: 3, height: '100%' }}>
          {/* Navigation Pane */}
          <Box width="300px" flexShrink={0}>
            <CustomToggleButtonGroup
              views={SupportPageViews}
              activeView={activeView}
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
                {currentView?.label}
              </Typography>

              <Stack gap={2}>{children}</Stack>
            </Box>

            {/* Chevron Arrows */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={
                currentIndex === 0
                  ? 'flex-end'
                  : currentIndex === SupportPageViews.length - 1
                  ? 'flex-start'
                  : 'space-between'
              }
              sx={{ width: '100%', '& .MuiButton-root': { fontWeight: 700 } }}>
              {currentIndex > 0 && (
                <Button
                  onClick={() => handleViewChange(prevView.value)}
                  startIcon={<Icon path={mdiChevronLeft} size={1} />}>
                  Previous
                </Button>
              )}
              {currentIndex < SupportPageViews.length - 1 && (
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
