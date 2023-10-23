import { Button, Paper, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

export const SurveyLocationPage = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      position="relative"
      sx={{
        background: '#fff'
      }}>
      <Box
        zIndex={999}
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}>
        <>
          <Paper
            square
            elevation={0}
            sx={{
              pt: 3,
              pb: 3.5,
              px: 3
            }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h2">Survey Area Boundaries</Typography>
              <Button color="primary" variant="outlined" onClick={() => console.log('Close Survey Area Page')}>
                Close
              </Button>
            </Box>
          </Paper>
        </>
      </Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden">
        {/* Survey Locations */}
        <Box
          flex="0 0 auto"
          width={400}
          sx={{
            borderRightStyle: 'solid',
            borderRightWidth: '1px',
            borderRightColor: grey[300]
          }}></Box>

        {/* Map Component */}
        <Box flex="1 1 auto" overflow="hidden">
          {/* <SurveyAreaMapControl
            map_id=""
            title=""
            formik_key=""
            formik_props={{} as any as FormikContextType<ISurveyLocationForm>}
          /> */}
        </Box>
      </Box>
    </Box>
  );
};
