import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  assert(codesContext.codesDataLoader.data);
  assert(projectContext.projectDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const projectData = projectContext.projectDataLoader.data.projectData;

  const projectActivities =
    codes.activity
      .filter((code) => projectData.project.project_activities.includes(code.id))
      .map((code) => code.name)
      .join(', ') || '';

  return (
    <Box component="dl" my={0}>
      <Grid container spacing={1}>
        <Grid item sm={6}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Type
          </Typography>
          <Typography component="dd">
            {codes.project_type.find((item: any) => item.id === projectData.project.project_type)?.name}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Timeline
          </Typography>
          <Typography component="dd">
            {projectData.project.end_date ? (
              <>
                {getFormattedDateRangeString(
                  DATE_FORMAT.ShortMediumDateFormat,
                  projectData.project.start_date,
                  projectData.project.end_date
                )}
              </>
            ) : (
              <>
                <span>Start Date:</span>{' '}
                {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, projectData.project.start_date)}
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
