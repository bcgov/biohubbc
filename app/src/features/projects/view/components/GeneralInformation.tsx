import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const projectData = projectContext.projectDataLoader.data.projectData;

  const projectPrograms =
    codes.program
      .filter((code) => projectData.project.project_programs.includes(code.id))
      .map((code) => code.name)
      .join(', ') || '';

  return (
    <Box component="dl" my={0}>
      <Grid container spacing={0}>
        <Grid item sm={6}>
          <Typography component="dt" color="textSecondary" variant="subtitle2">
            Program
          </Typography>
          <Typography component="dd">{projectPrograms ? <>{projectPrograms}</> : 'No Programs'}</Typography>
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
                <span>Start Date: </span>
                {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, projectData.project.start_date)}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInformation;
