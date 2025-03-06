import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React from 'react';
import { getFormattedIdentitySource } from 'utils/Utils';

export interface IViewAccessReuqestFormProps {
  request: IGetAccessRequestsListResponse;
  bannerText: string;
}

/**
 * Component to view system access requests without the ability to edit the user's system role
 *
 * @return {*}
 */
export const ViewAccessRequestForm: React.FC<IViewAccessReuqestFormProps> = (props: IViewAccessReuqestFormProps) => {
  const formattedUsername = [
    getFormattedIdentitySource(props.request.data.identitySource as SYSTEM_IDENTITY_SOURCE),
    props.request.data.username
  ]
    .filter(Boolean)
    .join('/');

  return (
    <>
      <Box bgcolor={blue[50]} px={1} py={2} borderRadius="4px" mb={2}>
        <Typography variant="subtitle2" color="textSecondary">
          <Box display="flex">
            <Icon path={mdiInformationOutline} size={0.9} style={{ marginRight: '6px' }} />
            {props.bannerText}
          </Box>
        </Typography>
      </Box>
      <Box>
        <Typography component="h3" variant="h5">
          User Details
        </Typography>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography component="dd">{props.request.data.name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Username
              </Typography>
              <Typography component="dd">{formattedUsername}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Email Address
              </Typography>
              <Typography component="dd">{props.request.data.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Date of Request
              </Typography>
              <Typography component="dd">
                {dayjs(props.request.create_date).format(DATE_FORMAT.ShortMediumDateTimeFormat)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Company
              </Typography>
              <Typography component="dd">
                {('company' in props.request.data && props.request.data.company) || 'Not Applicable'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Reason for Request
              </Typography>
              <Typography component="dd">{props.request.data.reason}</Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};
