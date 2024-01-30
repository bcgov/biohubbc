import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface IPageHeader {
  title: string;
  subTitleJSX?: JSX.Element;
  breadCrumbJSX?: JSX.Element;
  buttonJSX?: JSX.Element;
}
/**
 * Generic header for all views
 *
 * @return {*}
 */
const PageHeader = (props: IPageHeader) => {
  const { title, subTitleJSX, breadCrumbJSX, buttonJSX } = props;

  return (
    <Paper
      elevation={0}
      square={true}
      id="pageTitle"
      sx={{
        position: { sm: 'relative', lg: 'sticky' },
        top: 0,
        zIndex: 1002,
        borderBottom: '1px solid' + grey[300]
      }}>
      <Container maxWidth={'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
        {breadCrumbJSX}
        <Stack
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems="flex-start"
          justifyContent="space-between"
          gap={{ xs: 1, lg: 2 }}>
          <Box>
            <Typography variant="h1">{title}</Typography>
            {subTitleJSX && (
              <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
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
      </Container>
    </Paper>
  );
};

export default PageHeader;
