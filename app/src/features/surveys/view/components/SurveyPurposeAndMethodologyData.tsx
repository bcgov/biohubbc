import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  vantageCodes: {
    position: 'relative',
    display: 'inline-block',
    marginRight: theme.spacing(1.25),
    '&::after': {
      content: `','`,
      position: 'absolute',
      top: 0
    },
    '&:last-child::after': {
      display: 'none'
    }
  }
}));

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData = () => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  // Codes data must be loaded by the parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Survey data must be loaded by the parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const surveyData = surveyContext.surveyDataLoader.data.surveyData;

  return (
    <>
      <Box>
        <dl>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Intended Outcome
              </Typography>
              <Typography component="dd" variant="body1" data-testid="survey_intended_outcome">
                {Boolean(surveyData.purpose_and_methodology.intended_outcome_id) &&
                  codes?.intended_outcomes?.find(
                    (item: any) => item.id === surveyData.purpose_and_methodology.intended_outcome_id
                  )?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Field Method
              </Typography>
              <Typography component="dd" variant="body1" data-testid="survey_field_method">
                {Boolean(surveyData.purpose_and_methodology.field_method_id) &&
                  codes?.field_methods?.find(
                    (item: any) => item.id === surveyData.purpose_and_methodology.field_method_id
                  )?.name}
              </Typography>
              <Typography component="dd" variant="body1"></Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Ecological Season
              </Typography>
              <Typography component="dd" variant="body1" data-testid="survey_ecological_season">
                {Boolean(surveyData.purpose_and_methodology.ecological_season_id) &&
                  codes?.ecological_seasons?.find(
                    (item: any) => item.id === surveyData.purpose_and_methodology.ecological_season_id
                  )?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Vantage Code
              </Typography>
              {surveyData.purpose_and_methodology.vantage_code_ids?.map((vc_id: number, index: number) => {
                return (
                  <Typography
                    component="dd"
                    variant="body1"
                    key={`key-${vc_id}`}
                    className={classes.vantageCodes}
                    data-testid="survey_vantage_code">
                    {codes?.vantage_codes?.find((item: any) => item.id === vc_id)?.name}
                  </Typography>
                );
              })}
            </Grid>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Additional Details
              </Typography>
              <Typography component="dd" variant="body1" data-testid="survey_additional_details">
                {surveyData.purpose_and_methodology.additional_details || 'No additional details'}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default SurveyPurposeAndMethodologyData;
