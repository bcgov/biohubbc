import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import SurveySectionHeader from './SurveySectionHeader';

interface SurveySectionFullPageLayoutProps {
  sideBarComponent: JSX.Element;
  mainComponent: JSX.Element;
  pageTitle: string;
}

export const SurveySectionFullPageLayout = (props: SurveySectionFullPageLayoutProps) => {
  const { sideBarComponent, mainComponent, pageTitle } = props;
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" data-testid="fullpage-spinner" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      overflow="hidden"
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveySectionHeader
        data-testid="fullpage-section-header"
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
        title={pageTitle}
      />

      <Stack
        flexDirection="row"
        gap={1}
        sx={{
          flex: '1 1 auto',
          p: 1,
          overflow: 'hidden'
        }}>
        <Box
          sx={{
            flex: '0 0 auto',
            position: 'relative',
            width: '400px'
          }}>
          {sideBarComponent}
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            position: 'relative'
          }}>
          {mainComponent}
        </Box>
      </Stack>
    </Stack>
  );
};
