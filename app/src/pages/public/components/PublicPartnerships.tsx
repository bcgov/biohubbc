import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPublicPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a public (published) project.
 *
 * @return {*}
 */
const PublicPartnerships: React.FC<IPublicPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    }
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <>
      <Box>
        <Box mb={2} height="2rem">
          <Typography variant="h3">Partnerships</Typography>
        </Box>
      </Box>

      <dl className="ddInline">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Indigenous Partnerships
            </Typography>
            {indigenous_partnerships?.map((indigenousPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {indigenousPartnership}
                </Typography>
              );
            })}

            {!hasIndigenousPartnerships && (
              <Typography component="dd" variant="body1">
                No Indigenous Partnerships
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Other Partnerships
            </Typography>
            {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <Typography component="dd" variant="body1" key={index}>
                  {stakeholderPartnership}
                </Typography>
              );
            })}

            {!hasStakeholderPartnerships && (
              <Typography component="dd" variant="body1">
                No Other Partnerships
              </Typography>
            )}
          </Grid>
        </Grid>
      </dl>
    </>
  );
};

export default PublicPartnerships;
