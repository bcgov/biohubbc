import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IPublicProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a public (published) project.
 *
 * @return {*}
 */
const PublicGeneralInformation: React.FC<IPublicProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { project },
    codes
  } = props;

  const projectActivities =
    codes?.activity
      ?.filter((item) => project.project_activities.includes(item.id))
      ?.map((item) => item.name)
      .join(', ') || '';

  return (
    <Box>
      <Box mb={2} height="2rem">
        <Typography variant="h3">General Information</Typography>
      </Box>
      <dl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Project Name
            </Typography>
            <Typography component="dd" variant="body1">
              {project.project_name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Project Type
            </Typography>
            <Typography component="dd" variant="body1">
              {codes?.project_type?.find((item: any) => item.id === project.project_type)?.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Timeline
            </Typography>
            <Typography component="dd" variant="body1">
              {project.end_date ? (
                <>
                  {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date, project.end_date)}
                </>
              ) : (
                <>
                  <span>Start Date:</span>{' '}
                  {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date)}
                </>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Activities
            </Typography>
            <Typography component="dd" variant="body1">
              {projectActivities ? <>{projectActivities}</> : 'No Activities'}
            </Typography>
          </Grid>
        </Grid>
      </dl>
    </Box>
  );
};

export default PublicGeneralInformation;
