import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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
      <Box display="flex">
        <Typography component="dt" color="textSecondary">
          Indigenous
        </Typography>
        {indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
          return (
            <Typography component="dd" key={index}>
              {codes?.first_nations?.find((item: any) => item.id === indigenousPartnership)?.name}
            </Typography>
          );
        })}

        {!hasIndigenousPartnerships && <Typography component="dd">None</Typography>}
      </Box>
      <Box display="flex" mt={1}>
        <Typography component="dt" color="textSecondary">
          Other
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
            None
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Partnerships;
