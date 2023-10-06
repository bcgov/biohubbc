import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
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
    surveyData: { survey_details, species, permit }
  } = surveyForViewData;

  const codes = codesContext.codesDataLoader.data;

  const surveyTypes =
    codes.type
      .filter((code) => survey_details.survey_types.includes(code.id))
      .map((code) => code.name)
      .join(', ') || '';

  return (
    <>
      <Box component="section">
        <Typography component="h4">General Information</Typography>
        <Divider></Divider>
        <Box component="dl" my={0}>
          <Grid container spacing={1}>
            <Grid item sm={12}>
              <Typography component="dt" color="textSecondary" variant="subtitle2">
                Types
              </Typography>
              <Typography component="dd">{surveyTypes ? <>{surveyTypes}</> : 'No Types'}</Typography>
            </Grid>
            <Grid item sm={6}>
              <Typography component="dt" color="textSecondary" variant="subtitle2">
                Timeline
              </Typography>
              <Typography component="dd" data-testid="survey_timeline">
                {survey_details.end_date ? (
                  <>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
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
            <Grid item sm={6}>
              <Typography component="dt" color="textSecondary" variant="subtitle2">
                Focal Species
              </Typography>
              {species.focal_species_names?.map((focalSpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {focalSpecies}
                  </Typography>
                );
              })}
            </Grid>
            <Grid item sm={6}>
              <Typography component="dt" color="textSecondary" variant="subtitle2">
                Ancillary Species
              </Typography>
              {species.ancillary_species_names?.map((ancillarySpecies: string, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {ancillarySpecies}
                  </Typography>
                );
              })}
              {species.ancillary_species_names?.length <= 0 && (
                <Typography component="dd" variant="body1">
                  No Ancillary Species
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box component="section">
        <Typography component="h4">Permits</Typography>
        <Divider></Divider>
        <List disablePadding>
          {!permit.permits.length && (
            <List disablePadding>
              <ListItem divider disableGutters>
                <Typography variant="body1">No Permits</Typography>
              </ListItem>
            </List>
          )}
          {permit.permits?.map((item, index: number) => {
            return (
              <ListItem divider disableGutters key={index}>
                <Typography variant="body1">
                  {item.permit_type} - {item.permit_number}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
