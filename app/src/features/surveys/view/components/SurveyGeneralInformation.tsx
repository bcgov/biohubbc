import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const {
    surveyData: { survey_details, species, permit }
  } = surveyForViewData;

  return (
    <>
      <Box component="section">
        <Typography component="h4">General Information</Typography>
        <Divider></Divider>
        <Box component="dl" my={0}>
          <Grid container spacing={1}>
            <Grid item sm={6}>
              <Typography component="dt" color="textSecondary" variant="subtitle2">
                Survey Lead
              </Typography>
              <Typography component="dd">
                {survey_details.biologist_first_name} {survey_details.biologist_last_name}
              </Typography>
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

      <Box component="section">
        <Typography component="h4">Funding Sources</Typography>
        <Divider></Divider>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
