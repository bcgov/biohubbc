import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
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
 * Partnerships content for a survey.
 *
 * @return {*}
 */
const Partnerships = () => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Project data must be loaded by a parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const surveyData = surveyContext.surveyDataLoader.data.surveyData;

  const hasIndigenousPartnerships = Boolean(surveyData.partnerships.indigenous_partnerships?.length);
  const hasStakeholderPartnerships = Boolean(surveyData.partnerships.stakeholder_partnerships?.length);

  return (
    <Box component="dl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
        <Typography component="dt">
          Indigenous Partnerships:
        </Typography>
        {surveyData.partnerships.indigenous_partnerships?.map((indigenousPartnership: number) => {
          return (
            <Typography
              component="dd"
              key={`first-nations-${indigenousPartnership}`}
              className={classes.projectPartners}>
              {codes.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
            </Typography>
          );
        })}

        {!hasIndigenousPartnerships && <Typography component="dd">None</Typography>}
        </Grid>
        <Grid item xs={12}>
          <Typography component="dt">
            Other Partnerships:
          </Typography>
          {surveyData.partnerships.stakeholder_partnerships?.map((stakeholderPartnership: string) => {
            return (
              <Typography
                component="dd"
                className={classes.projectPartners}
                key={`stakeholder-${stakeholderPartnership}`}>
                {stakeholderPartnership}
              </Typography>
            );
          })}

          {!hasStakeholderPartnerships && (
            <Typography component="dd">
              None
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Partnerships;
