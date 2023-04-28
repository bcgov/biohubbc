import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import AutocompleteFieldWithType from 'components/fields/AutocompleteFieldWithType';
import CustomTextField from 'components/fields/CustomTextField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import { IInvestmentActionCategoryOption } from './ProjectFundingForm';

export interface IProjectFundingFormArrayItem {
  id: number;
  agency_id?: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_project_id: string;
  funding_amount?: number;
  start_date: string;
  end_date: string;
  revision_count: number;
  first_nations_id?: number;
}

export const ProjectFundingFormArrayItemInitialValues: IProjectFundingFormArrayItem = {
  id: 0,
  agency_id: ('' as unknown) as number,
  investment_action_category: ('' as unknown) as number,
  investment_action_category_name: '',
  agency_project_id: '',
  funding_amount: ('' as unknown) as number,
  start_date: '',
  end_date: '',
  revision_count: 0,
  first_nations_id: undefined
};

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape({
  agency_id: yup.number().transform((value) => (isNaN(value) && null) || value),
  first_nations_id: yup.number().transform((value) => (isNaN(value) && null) || value),
  investment_action_category: yup.number().required('Required'),
  agency_project_id: yup.string().max(50, 'Cannot exceed 50 characters').nullable(true),
  funding_amount: yup.number().when('first_nations_id', {
    is: !undefined,
    then: yup
      .number()
      .transform((value) => (isNaN(value) && null) || value)
      .typeError('Must be a number')
      .min(0, 'Must be a positive number')
      .max(9999999999, 'Must be less than $9,999,999,999')
  }),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().required('Required').isEndDateAfterStartDate('start_date')
});

/*

  1. modify the items to add type
  2. Add the first nations names to the list
  3. Add special consideration when selecting a first nations name
  4. modify the save to account for the changes
  5. Modify the fetch to account for any changes in the model
  6. create an enum or type to account for the text on the 'action' items


  Q's
  1. Does the agency name still make sense?
  
*/
export interface IProjectFundingItemFormProps1 {
  funding_sources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategoryOption[];
}

export enum FundingSourceType {
  FUNDING_SOURCE,
  FIRST_NATIONS
}
export interface IFundingSourceAutocompleteField {
  value: number;
  label: string;
  type: FundingSourceType;
}
export interface IProjectFundingItemFormProps {
  sources: IFundingSourceAutocompleteField[];
  investment_action_category: IInvestmentActionCategoryOption[];
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
  const formikProps = useFormikContext<IProjectFundingFormArrayItem>();
  const { values, touched, errors, handleChange, handleSubmit, setFieldValue } = formikProps;

  // Only show investment_action_category if certain agency_id values are selected
  // Toggle investment_action_category label and dropdown values based on chosen agency_id
  const investment_action_category_label =
    (values.agency_id === 1 && 'Investment Action') || (values.agency_id === 2 && 'Investment Category') || null;

  return (
    <form data-testid="funding-item-form" onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography id="agency_details" component="legend">
          Agency Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
              <Box>
                <AutocompleteFieldWithType
                  id="agency_id"
                  name="agency_name"
                  label={'Agency Name'}
                  options={props.sources}
                  onChange={(event, options) => {
                    // investment_action_category is dependent on agency_id, so reset it if agency_id changes
                    setFieldValue(
                      'investment_action_category',
                      ProjectFundingFormArrayItemInitialValues.investment_action_category
                    );
                    console.log(
                      `Action category: ${ProjectFundingFormArrayItemInitialValues.investment_action_category}`
                    );
                    if (options?.type === FundingSourceType.FIRST_NATIONS) {
                      setFieldValue('first_nations_id', options?.value);
                    } else {
                      setFieldValue('agency_id', options?.value);
                      // If an agency_id with a `Not Applicable` investment_action_category is chosen, auto select
                      // it for the user.
                      //TODO: take a look at this logic, seems backwards
                      if (event.target.value !== 1 && event.target.value !== 2) {
                        setFieldValue(
                          'investment_action_category',
                          props.investment_action_category.find((item) => item.fs_id === event.target.value)?.value || 0
                        );
                      }
                    }
                  }}
                />
              </Box>
              <FormHelperText>{errors.agency_id}</FormHelperText>
            </FormControl>
          </Grid>
          {investment_action_category_label && (
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                <InputLabel id="investment_action_category-label">{investment_action_category_label}</InputLabel>
                <Select
                  id="investment_action_category"
                  name="investment_action_category"
                  labelId="investment_action_category-label"
                  label={investment_action_category_label}
                  value={values.investment_action_category}
                  onChange={handleChange}
                  error={touched.investment_action_category && Boolean(errors.investment_action_category)}
                  displayEmpty
                  inputProps={{
                    'aria-label': `${investment_action_category_label}`,
                    'data-testid': 'investment_action_category'
                  }}>
                  {props.investment_action_category
                    // Only show the investment action categories whose fs_id matches the agency_id id
                    .filter((item) => item.fs_id === values.agency_id)
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
            <CustomTextField name="agency_project_id" label="Agency Project ID" />
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" mt={5}>
        <Typography component="legend">Funding Details</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DollarAmountField required={true} id="funding_amount" name="funding_amount" label="Funding Amount" />
          </Grid>
          <StartEndDateFields
            formikProps={formikProps}
            startName="start_date"
            endName="end_date"
            startRequired={true}
            endRequired={true}
          />
        </Grid>
      </Box>
      <Box mt={4}>
        <Divider />
      </Box>
    </form>
  );
};

export default ProjectFundingItemForm;
