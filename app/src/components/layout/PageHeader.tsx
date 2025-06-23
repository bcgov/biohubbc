import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';

interface IPageHeader {
  title: string;
  subTitleJSX?: JSX.Element;
  breadCrumbJSX?: JSX.Element;
  buttonJSX?: JSX.Element;
  tabsJSX?: JSX.Element;
  isLoading?: boolean;
}
/**
 * Generic header for all views
 *
 * @return {*}
 */
const PageHeader = (props: IPageHeader) => {
  const { title, subTitleJSX, breadCrumbJSX, buttonJSX, isLoading, tabsJSX } = props;

  return (
    <Paper
      square={true}
      id="pageTitle"
      sx={{
        position: { sm: 'relative', lg: 'sticky' },
        top: 0,
        zIndex: 1002
      }}>
      <Container maxWidth="xl" sx={{ pt: 3, px: 3, pb: tabsJSX ? 0 : 3 }}>
        {breadCrumbJSX && (
          <Box minHeight="25px">
            <LoadingGuard
              isLoadingFallbackDelay={600}
              isLoading={isLoading}
              isLoadingFallback={<SkeletonHorizontalStack />}>
              {breadCrumbJSX}
            </LoadingGuard>
          </Box>
        )}
        <Stack
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems="flex-start"
          justifyContent="space-between"
          flex="1 1 auto"
          gap={0}>
          <Box flex="1 1 auto">
            <Typography variant="h1" mb={0.5}>
              {title}
            </Typography>
            {subTitleJSX && (
              <Stack flexDirection="row" alignItems="center" gap={1}>
                {subTitleJSX}
              </Stack>
            )}
          </Box>
          {buttonJSX && (
            <Stack flexDirection="row" alignItems="center" gap={1} my="4px">
              {buttonJSX}
            </Stack>
          )}
        </Stack>
        {tabsJSX && tabsJSX}
      </Container>
    </Paper>
  );
};

export default PageHeader;
