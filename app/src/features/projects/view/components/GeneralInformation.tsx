import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation: React.FC<IProjectDetailsProps> = (props) => {
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
      <Box display="flex">
        <Typography component="dt" color="textSecondary">
          Type
        </Typography>
        <Typography component="dd">
          {codes?.project_type?.find((item: any) => item.id === project.project_type)?.name}
        </Typography>
      </Box>
      <Box display="flex">
        <Typography component="dt" color="textSecondary">
          Timeline
        </Typography>
        <Typography component="dd">
          {project.end_date ? (
            <>{getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date, project.end_date)}</>
          ) : (
            <>
              <span>Start Date:</span>{' '}
              {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, project.start_date)}
            </>
          )}
        </Typography>
      </Box>
      <Box display="flex">
        <Typography component="dt" color="textSecondary">
          Activities
        </Typography>
        <Typography component="dd">{projectActivities ? <>{projectActivities}</> : 'No Activities'}</Typography>
      </Box>
    </Box>
  );
};

export default GeneralInformation;
