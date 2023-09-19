import { Breadcrumbs, CircularProgress, Link, Paper, Typography } from '@mui/material';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

const SamplingSiteHeader = () => {
  const surveyContext = useContext(SurveyContext);
  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }
  return (
    <>
      <Paper
        square
        sx={{
          pt: 3,
          pb: 3.5,
          px: 3
        }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 1,
            fontSize: '14px'
          }}>
          <Link underline="hover" href="#">
            {surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Manage Survey Observations
          </Link>
          <Typography color="text.secondary" variant="body2">
            New Sampling Site
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            ml: '-2px'
          }}>
          New Sampling Site
        </Typography>
      </Paper>
    </>
  );
};

export default SamplingSiteHeader;
