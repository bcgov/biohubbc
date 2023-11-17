import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ISurveyHeader {
  title: string;
  subTitle?: JSX.Element;
  breadCrumb?: JSX.Element;
  buttonJSX?: JSX.Element;
}
/**
 * Generic Survey header for all survey views
 *
 * @return {*}
 */
const SurveyBaseHeader = (props: ISurveyHeader) => {
  const { title, subTitle, breadCrumb, buttonJSX } = props;

  return (
    <Paper
      elevation={0}
      square={true}
      id="pageTitle"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1002,
        pt: 3,
        pb: 3.75,
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: grey[300]
      }}>
      <Container maxWidth="xl">
        {breadCrumb}
        <Box
          display="flex"
          justifyContent="space-between"
          gap="1.5rem"
          sx={{
            flexDirection: { xs: 'column', lg: 'row' }
          }}>
          <Box>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                display: 'block',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                ml: '-2px'
              }}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" flexWrap="wrap" mt={1}>
              {subTitle}
            </Box>
          </Box>
          <Box display="flex" alignItems="flex-start" flex="0 0 auto">
            {buttonJSX}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default SurveyBaseHeader;
