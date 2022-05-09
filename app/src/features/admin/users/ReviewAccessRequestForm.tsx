import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';

export interface IReviewAccessRequestForm {
  system_role: number;
}

export const ReviewAccessRequestFormInitialValues: IReviewAccessRequestForm = {
  system_role: ('' as unknown) as number
};

export const ReviewAccessRequestFormYupSchema = yup.object().shape({
  system_role: yup.number().nullable().notRequired()
});

export interface IReviewAccessRequestFormProps {
  request: IGetAccessRequestsListResponse;
  system_roles: IAutocompleteFieldOption<number>[];
}

/**
 * Component to review system access requests.
 *
 * @return {*}
 */
const ReviewAccessRequestForm: React.FC<IReviewAccessRequestFormProps> = (props) => {
  const { handleSubmit } = useFormikContext<IReviewAccessRequestForm>();

  return (
    <Box>
      <Box mb={5}>
        <Box mb={2}>
          <Typography variant="h3">User Details</Typography>
        </Box>
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
                Email Address
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.email}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Username
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.identitySource.toUpperCase()}/{props.request.data.username}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Request Date
              </Typography>
              <Typography component="dd" variant="body1">
                {getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, props.request.create_date)}
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
                Reason
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.reason}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
      <Box mb={5}>
        <Box mb={2}>
          <Typography variant="h3">Review / Update Requested System Role</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AutocompleteField
                id="system_role"
                name="system_role"
                label={'System Role'}
                options={props.system_roles}
              />
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default ReviewAccessRequestForm;
