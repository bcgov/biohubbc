import Box from '@mui/material/Box';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  projectPartners: {
    position: 'relative',
    display: 'inline-block',
    marginRight: theme.spacing(1.25),
    '&::after': {
      content: `','`,
      position: 'absolute',
      top: 0
    },
    '&:last-child::after': {
      display: 'none'
    }
  }
}));

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships = () => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const projectData = projectContext.projectDataLoader.data.projectData;

  const hasIndigenousPartnerships =
    projectData.partnerships.indigenous_partnerships && projectData.partnerships.indigenous_partnerships.length;
  const hasStakeholderPartnerships =
    projectData.partnerships.stakeholder_partnerships && projectData.partnerships.stakeholder_partnerships.length;

  return (
    <Box component="dl" my={0}>
      <Box>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          Indigenous
        </Typography>
        {projectData.partnerships.indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
          return (
            <Typography component="dd" key={index} className={classes.projectPartners}>
              {codes.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
            </Typography>
          );
        })}

        {!hasIndigenousPartnerships && <Typography component="dd">None</Typography>}
      </Box>
      <Box mt={1}>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          Other Partnerships
        </Typography>
        {projectData.partnerships.stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
          return (
            <Typography component="dd" variant="body1" className={classes.projectPartners} key={index}>
              {stakeholderPartnership}
            </Typography>
          );
        })}

        {!hasStakeholderPartnerships && (
          <Typography component="dd" variant="body1">
            None
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Partnerships;
