import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData || !codesContext.codesDataLoader.data) {
    return <></>;
  }

  const {
    surveyData: { survey_details, species }
  } = surveyForViewData;

  const codes = codesContext.codesDataLoader.data;

  const surveyTypes =
    codes.type
      .filter((code) => survey_details.survey_types.includes(code.id))
      .map((code) => code.name)
      .join(', ') || '';

  return (
    <>
      <Box component="dl">
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <Typography component="dt">
              Survey Type
            </Typography>
            <Typography component="dd">{surveyTypes ? <>{surveyTypes}</> : 'No Types'}</Typography>
          </Grid>
          <Grid item sm={12}>
            <Typography component="dt">
              Start/End Date
            </Typography>
            <Typography component="dd" data-testid="survey_timeline">
              {survey_details.end_date ? (
                <>
                  {getFormattedDateRangeString(
                    DATE_FORMAT.MediumDateFormat,
                    survey_details.start_date,
                    survey_details.end_date
                  )}
                </>
              ) : (
                <>
                  <span>Start Date:</span>{' '}
                  {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, survey_details.start_date)}
                </>
              )}
            </Typography>
          </Grid>
          <Grid item sm={12}>
            <Typography component="dt">
              Species of Interest
            </Typography>
            <Box flex="1 1 auto">
              {species.focal_species_names?.map((focalSpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {focalSpecies}
                  </Typography>
                );
              })}
            </Box>
          </Grid>
          <Grid item sm={12}>
            <Typography component="dt">
              Secondary Species
            </Typography>
            <Box flex='1 1 auto'>
              {species.ancillary_species_names?.map((ancillarySpecies: string, index: number) => {
                return (
                  <Typography component="dd" key={index}>
                    {ancillarySpecies}
                  </Typography>
                );
              })}
              {species.ancillary_species_names?.length <= 0 && (
                <Typography component="dd">
                  No secondary species of interest
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
