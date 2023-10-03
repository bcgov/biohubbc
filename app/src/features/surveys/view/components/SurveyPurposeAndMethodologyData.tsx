import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Purpose and Methodology data content for a survey.
 *
 * @return {*}
 */
const SurveyPurposeAndMethodologyData = () => {
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
          <Grid container spacing={{sm: 1, md: 2}}>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column">
                <Typography component="dt">
                  Purpose of Survey
                </Typography>
                <Typography component="dd" variant="body1" data-testid="survey_intended_outcome">
                  {Boolean(surveyData.purpose_and_methodology.intended_outcome_id) &&
                    codes?.intended_outcomes?.find(
                      (item: any) => item.id === surveyData.purpose_and_methodology.intended_outcome_id
                    )?.name}
                </Typography>
              </Box>
            </Grid>
            {surveyData.purpose_and_methodology.additional_details &&
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column">
                  <Typography component="dt">
                    Additional Details
                  </Typography>
                  <Typography component="dd" variant="body1" data-testid="survey_additional_details">
                    {surveyData.purpose_and_methodology.additional_details}
                  </Typography>
                </Box>
              </Grid>
            }
            <Grid item xs={6}>
              <Typography component="dt">
                Field Method
              </Typography>
              <Typography component="dd" data-testid="survey_field_method">
                {Boolean(surveyData.purpose_and_methodology.field_method_id) &&
                  codes?.field_methods?.find(
                    (item: any) => item.id === surveyData.purpose_and_methodology.field_method_id
                  )?.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="dt">
                Ecological Season
              </Typography>
              <Typography component="dd" data-testid="survey_ecological_season">
                {Boolean(surveyData.purpose_and_methodology.ecological_season_id) &&
                  codes?.ecological_seasons?.find(
                    (item: any) => item.id === surveyData.purpose_and_methodology.ecological_season_id
                  )?.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography component="dt">
                Vantage Code(s)
              </Typography>
              {surveyData.purpose_and_methodology.vantage_code_ids?.map((vc_id: number, index: number) => {
                return (
                  <Typography
                    component="dd"
                    key={`key-${vc_id}`}
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mr: 1.25,
                      '&::after': {
                        content: `','`,
                        position: 'absolute',
                        top: 0
                      },
                      '&:last-child::after': {
                        display: 'none'
                      }
                    }}
                    data-testid="survey_vantage_code">
                    {codes?.vantage_codes?.find((item: any) => item.id === vc_id)?.name}
                  </Typography>
                );
              })}
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default SurveyPurposeAndMethodologyData;
