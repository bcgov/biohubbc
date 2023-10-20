import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Proprietary data content for a survey.
 *
 * @return {*}
 */
const SurveyProprietaryData = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { proprietor }
  } = surveyForViewData;

  return (
    <>
      <Box>
        <dl>
          {!proprietor && (
            <Grid container spacing={1}>
              <Grid item>
                <Typography data-testid="survey_not_proprietary">
                  The data captured in this survey is not proprietary.
                </Typography>
              </Grid>
            </Grid>
          )}
          {proprietor && (
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Proprietor Name
                </Typography>
                <Typography component="dd" variant="body1" data-testid="survey_proprietor_name">
                  {proprietor.proprietor_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Data Category
                </Typography>
                <Typography component="dd" variant="body1" data-testid="survey_proprietor_type_name">
                  {proprietor.proprietor_type_name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Category Rationale
                </Typography>
                <Typography style={{ wordBreak: 'break-all' }} data-testid="survey_category_rationale">
                  {proprietor.category_rationale}
                </Typography>
              </Grid>
            </Grid>
          )}
        </dl>
      </Box>
    </>
  );
};

export default SurveyProprietaryData;
