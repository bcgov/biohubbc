import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { get } from 'lodash-es';
import React from 'react';
import { getFormattedIdentitySource } from 'utils/Utils';
import yup from 'utils/YupSchema';

export interface IReviewAccessRequestForm {
  system_role: number;
  requires_confirmation: boolean;
  confirmed: boolean;
}

export const ReviewAccessRequestFormInitialValues: IReviewAccessRequestForm = {
  system_role: '' as unknown as number,
  requires_confirmation: false,
  confirmed: false
};

export const ReviewAccessRequestFormYupSchema = yup.object().shape({
  system_role: yup.number().nullable().required('A role is required.'),
  requires_confirmation: yup.boolean(),
  confirmed: yup.boolean().when('requires_confirmation', {
    is: (requires_confirmation: boolean) => requires_confirmation === true,
    then: yup.boolean().oneOf([true], 'Email confirmation is required').required('Email confirmation is required')
  })
});

interface IReviewAccessRequestFormProps {
  request: IGetAccessRequestsListResponse;
  system_roles: IAutocompleteFieldOption<number>[];
}

/**
 * Component to review system access requests.
 *
 * @return {*}
 */
const ReviewAccessRequestForm: React.FC<IReviewAccessRequestFormProps> = (props) => {
  const { handleSubmit, setFieldValue, setFieldError, values, errors, touched } =
    useFormikContext<IReviewAccessRequestForm>();

  const formattedUsername = [
    getFormattedIdentitySource(props.request.data.identitySource as SYSTEM_IDENTITY_SOURCE),
    props.request.data.username
  ]
    .filter(Boolean)
    .join('/');

  return (
    <Box>
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
              <Typography component="dd" variant="body1">
                {props.request.data.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Username
              </Typography>
              <Typography component="dd" variant="body1">
                {formattedUsername}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Email Address
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.email}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Date of Request
              </Typography>
              <Typography component="dd" variant="body1">
                {dayjs(props.request.create_date).format(DATE_FORMAT.ShortMediumDateTimeFormat)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Company
              </Typography>
              <Typography component="dd" variant="body1">
                {('company' in props.request.data && props.request.data.company) || 'Not Applicable'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Reason for Request
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.reason}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
      <Box mt={5}>
        <Typography
          component="h3"
          variant="h5"
          sx={{
            marginBottom: '18px'
          }}>
          System Role
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack gap={2}>
            <AutocompleteField
              id="system_role"
              name="system_role"
              label={'System Role'}
              options={props.system_roles}
              onChange={(_, option) => {
                setFieldValue('system_role', option?.value);
                // If the role is an administrator, require the user's email to be typed as confirmation
                if (
                  props.system_roles.some(
                    (role) => role.label.toLowerCase().includes('administrator') && role.value === option?.value
                  )
                ) {
                  setFieldValue('requires_confirmation', true);
                  return;
                }
                setFieldValue('requires_confirmation', false);
              }}
            />
            {/* Require the user's email to be typed in to confirm the assignment of administrator roles */}
            {values.requires_confirmation && (
              <TextField
                label="Confirm Email"
                placeholder="Type the user's email to confirm"
                onChange={(e) => {
                  if (e.currentTarget.value === props.request.data.email) {
                    setFieldError('confirmed', undefined);
                    setFieldValue('confirmed', true);
                    return;
                  }
                  setFieldValue('confirmed', false);
                }}
                error={get(touched, 'confirmed') && Boolean(get(errors, 'confirmed'))}
                helperText={get(touched, 'confirmed') && get(errors, 'confirmed')}
              />
            )}
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default ReviewAccessRequestForm;
