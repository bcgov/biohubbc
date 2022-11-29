import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

export interface ISurveyGeneralInformationProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation: React.FC<ISurveyGeneralInformationProps> = (props) => {
  const {
    surveyForViewData: {
      surveyData: { survey_details, species, funding, permit }
    }
  } = props;

  return (
    <>

      <Box component="section">
        <Typography component="h4">
          General Information
        </Typography>
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
              <Typography component="dd">
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
                Anciliary Species
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
                  No Ancilliary Species
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box component="section">
        <Typography component="h4">
          Permits
        </Typography>
        <Divider></Divider>
        <List disablePadding>
          {!permit.permits.length && (
            <List disablePadding>
              <ListItem divider disableGutters>
                No Permits
              </ListItem>
            </List>
          )}
          {permit.permits?.map((item, index: number) => {
            return (
              <ListItem divider disableGutters key={index}>
                <Typography variant="body1">{item.permit_type} - {item.permit_number}</Typography>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box component="section">
        <Typography component="h4">
          Funding Sources
        </Typography>
        <Divider></Divider>
          {!funding.funding_sources.length && (
            <List disablePadding>
              <ListItem divider disableGutters>
                <Typography variant="body1">No Funding Sources</Typography>
              </ListItem>
            </List>
          )}
          <List disablePadding>
            {funding.funding_sources?.map((item, index: number) => {
              return (
                <ListItem divider disableGutters key={index}>
                  <Box flex="1 1 auto">
                    <Box pb={1.25}>
                      <Typography component="span">
                        {item.agency_name}
                      </Typography>
                    </Box>
                    <Box component="dl" m={0}>
                      <Grid container spacing={1}>
                        <Grid item sm={6}>
                          <Typography component="dt" variant="subtitle2" color="textSecondary">
                            Project ID
                          </Typography>
                          <Typography component="dd">
                            {item.funding_source_project_id}
                          </Typography>
                        </Grid>
                        <Grid item sm={6}>
                          <Typography component="dt" variant="subtitle2" color="textSecondary">
                            Timeline
                          </Typography>
                          <Typography component="dd">
                            {getFormattedDateRangeString(
                              DATE_FORMAT.ShortMediumDateFormat,
                              item.funding_start_date,
                              item.funding_end_date
                            )}
                          </Typography>
                        </Grid>
                        <Grid item sm={12}>
                          <Typography component="dt" variant="subtitle2" color="textSecondary">
                            Funding Amount
                          </Typography>
                          <Typography component="dd">{getFormattedAmount(item.funding_amount)}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
      </Box>
    </>
  );
};

export default SurveyGeneralInformation;
