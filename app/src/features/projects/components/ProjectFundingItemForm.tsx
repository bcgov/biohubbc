import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField
} from '@material-ui/core';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik, FormikHelpers } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { IInvestmentActionCategory } from './ProjectFundingForm';

export interface IProjectFundingFormArrayItem {
  agency_name: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
}

export const ProjectFundingFormArrayItemInitialValues: IProjectFundingFormArrayItem = {
  agency_name: 0,
  investment_action_category: 0,
  agency_project_id: '',
  funding_amount: 0,
  start_date: '',
  end_date: ''
};

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape({
  agency_name: yup.number().min(1).required('Required'),
  investment_action_category: yup.number(),
  agency_project_id: yup.string(),
  funding_amount: yup.number().required('Required'),
  start_date: yup.date().required('Required'),
  end_date: yup
    .date()
    .when('start_date', (start_date: any, schema: any) => {
      return start_date && schema.min(start_date, 'End Date is before Start Date');
    })
    .required('Required')
});

export interface IProjectFundingItemFormProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (values: IProjectFundingFormArrayItem, helper: FormikHelpers<IProjectFundingFormArrayItem>) => void;
  initialValues: IProjectFundingFormArrayItem;
  funding_sources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategory[];
}

/**
 * A modal form for a single item of the project funding sources array.
 *
 * @See ProjectFundingForm.tsx
 *
 * @param {*} props
 * @return {*}
 */
const ProjectFundingItemForm: React.FC<IProjectFundingItemFormProps> = (props) => {
  return (
    <Formik
      initialValues={props.initialValues}
      enableReinitialize={true}
      validationSchema={ProjectFundingFormArrayItemYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={props.onSubmit}>
      {({ values, touched, errors, handleChange, handleSubmit, resetForm, setFieldValue }) => {
        // Only show investment_action_category if certain agency_name values are selected
        // Toggle investment_action_category label and dropdown values based on chosen agency_name
        const investment_action_category_label =
          (values.agency_name === 1 && 'Investment Action') ||
          (values.agency_name === 2 && 'Investment Category') ||
          null;

        return (
          <>
            <Dialog
              open={props.open}
              onClose={() => {
                props.onClose();
                resetForm();
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description">
              <DialogTitle id="alert-dialog-title">Add Funding Source</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">Enter Funding Source Details</DialogContentText>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                      <InputLabel id="agency_name-label" shrink={true}>
                        Agency Name
                      </InputLabel>
                      <Select
                        id="agency_name"
                        name="agency_name"
                        labelId="agency_name-label"
                        label="Agency Name"
                        value={values.agency_name}
                        onChange={(event) => {
                          handleChange(event);
                          // investment_action_category is dependent on agency_name, so reset it if agency_name changes
                          setFieldValue(
                            'investment_action_category',
                            ProjectFundingFormArrayItemInitialValues.investment_action_category
                          );

                          // If an agency_name with a `Not Applicable` investment_action_category is chosen, auto select
                          // it for the user.
                          if (event.target.value !== 1 && event.target.value !== 2) {
                            setFieldValue(
                              'investment_action_category',
                              props.investment_action_category.find((item) => item.fs_id === event.target.value)
                                ?.value || 0
                            );
                          }
                        }}
                        error={touched.agency_name && Boolean(errors.agency_name)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Agency Name' }}
                        input={<OutlinedInput notched label="Agency Name" />}>
                        {props.funding_sources.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errors.agency_name}</FormHelperText>
                    </FormControl>
                  </Grid>
                  {investment_action_category_label && (
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" required={false} style={{ width: '100%' }}>
                        <InputLabel id="investment_action_category-label" shrink={true}>
                          {investment_action_category_label}
                        </InputLabel>
                        <Select
                          id="investment_action_category"
                          name="investment_action_category"
                          labelId="investment_action_category-label"
                          label={investment_action_category_label}
                          value={values.investment_action_category}
                          onChange={handleChange}
                          error={touched.investment_action_category && Boolean(errors.investment_action_category)}
                          displayEmpty
                          inputProps={{ 'aria-label': `${investment_action_category_label}` }}
                          input={<OutlinedInput notched label={investment_action_category_label} />}>
                          {props.investment_action_category
                            // Only show the investment action categories whose fs_id matches the agency_name id
                            .filter((item) => item.fs_id === values.agency_name)
                            .map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.investment_action_category}</FormHelperText>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required={false}
                      id="agency_project_id"
                      name="agency_project_id"
                      label="Agency Project ID"
                      variant="outlined"
                      value={values.agency_project_id}
                      onChange={handleChange}
                      error={touched.agency_project_id && Boolean(errors.agency_project_id)}
                      helperText={errors.agency_project_id}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required={true}
                      id="funding_amount"
                      name="funding_amount"
                      label="Funding Amount"
                      type="number"
                      variant="outlined"
                      value={values.funding_amount}
                      onChange={handleChange}
                      error={touched.funding_amount && Boolean(errors.funding_amount)}
                      helperText={errors.funding_amount}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <Grid item>
                      <TextField
                        id="start_date"
                        name="start_date"
                        label="Start Date"
                        variant="outlined"
                        required={true}
                        value={values.start_date}
                        type="date"
                        onChange={handleChange}
                        error={touched.start_date && Boolean(errors.start_date)}
                        helperText={errors.start_date}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        id="end_date"
                        name="end_date"
                        label="End Date"
                        variant="outlined"
                        required={true}
                        value={values.end_date}
                        type="date"
                        onChange={handleChange}
                        error={touched.end_date && Boolean(errors.end_date)}
                        helperText={errors.end_date}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    props.onCancel();
                    resetForm();
                  }}
                  color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    handleSubmit();
                  }}
                  color="primary"
                  autoFocus>
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      }}
    </Formik>
  );
};

export default ProjectFundingItemForm;
