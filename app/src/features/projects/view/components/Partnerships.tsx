import Box from '@material-ui/core/Box';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const classes = useStyles();
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    },
    codes
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <Box component="dl" my={0}>
      <Box>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          Indigenous
        </Typography>
        {indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
          return (
            <Typography component="dd" key={index} className={classes.projectPartners}>
              {codes?.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
            </Typography>
          );
        })}

        {!hasIndigenousPartnerships && <Typography component="dd">None</Typography>}
      </Box>
      <Box mt={1}>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          Other Partnerships
        </Typography>
        {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
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
