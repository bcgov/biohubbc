import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateFormats';
import { useFormikContext } from 'formik';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';

export interface IReviewAccessRequestForm {
  system_roles: number[];
}

export const ReviewAccessRequestFormInitialValues: IReviewAccessRequestForm = {
  system_roles: []
};

export const ReviewAccessRequestFormYupSchema = yup.object().shape({
  system_roles: yup.array().min(1).required('Required')
});

export interface IReviewAccessRequestFormProps {
  request: IGetAccessRequestsListResponse;
  system_roles: IMultiAutocompleteFieldOption[];
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
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Username
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Email Address
              </Typography>
              <Typography component="dd" variant="body1">
                TODO Placeholder
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Regional Offices
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.regional_offices.join(', ')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Request Date
              </Typography>
              <Typography component="dd" variant="body1">
                {getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, props.request.create_date)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Additional Comments
              </Typography>
              <Typography component="dd" variant="body1">
                {props.request.data.comments}
              </Typography>
            </Grid>
          </Grid>
        </dl>
      </Box>
      <Box mb={5}>
        <Box mb={2}>
          <Typography variant="h3">Review / Update Role</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id={'system_roles'}
                label={'System Roles'}
                options={props.system_roles}
                required={true}
              />
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default ReviewAccessRequestForm;
