import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IProjectDetailsProps {
  projectForViewData: ProjectViewObject;
  codes: IGetAllCodeSetsResponse;
}

/**
 * General information content for a project.
 *
 * @param {IProjectDetailsProps} props
 * @return {*}
 */
const GeneralInformation = (props: IProjectDetailsProps) => {
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
    <Box component="dl" my={0}>
      <Grid container spacing={1}>
        <Grid item sm={6}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Type
          </Typography>
          <Typography component="dd">
            {codes?.project_type?.find((item: any) => item.id === project.project_type)?.name}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Timeline
          </Typography>
          <Typography component="dd">
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
        <Grid item sm={12}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Activities
          </Typography>
          <Typography component="dd">{projectActivities ? <>{projectActivities}</> : 'No Activities'}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInformation;
