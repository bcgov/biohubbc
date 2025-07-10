import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';

interface IBreadcrumbHeader {
  breadCrumbJSX?: JSX.Element;
  buttonJSX?: JSX.Element;
  isLoading?: boolean;
}

/**
 * Displays the breadcrumb as the title like in page header
 *
 * @return {*}
 */
export const BreadcrumbHeader = (props: IBreadcrumbHeader) => {
  const { breadCrumbJSX, buttonJSX, isLoading } = props;

  return (
    <Paper
      square={true}
      id="pageTitle"
      sx={{
        position: { sm: 'relative', lg: 'sticky' },
        top: 0,
        zIndex: 1002
      }}>
      <Container maxWidth="xl" sx={{ pt: 3, px: 3 }}>
        <Stack
          minHeight={65}
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems="flex-start"
          justifyContent="space-between"
          flex="1 1 auto"
          gap={0}>
          <Box flex="1 1 auto">
            <Stack gap={1} flexDirection="row" alignItems="center">
              <Box minHeight="25px">
                <LoadingGuard
                  isLoadingFallbackDelay={600}
                  isLoading={isLoading}
                  isLoadingFallback={<SkeletonHorizontalStack />}>
                  {breadCrumbJSX}
                </LoadingGuard>
              </Box>
            </Stack>
          </Box>
          {buttonJSX && (
            <Stack flexDirection="row" alignItems="center" gap={1} my="4px">
              {buttonJSX}
            </Stack>
          )}
        </Stack>
      </Container>
    </Paper>
  );
};
