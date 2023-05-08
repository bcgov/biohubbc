import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import DollarAmountField from 'components/fields/DollarAmountField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import FundingSourceAutocomplete, {
  IAutocompleteFieldOptionWithType
} from 'features/projects/components/FundingSourceAutocomplete';
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

export const ProjectFundingFormArrayItemYupSchema = yup.object().shape(
  {
    // if agency_id is present, first_nations_id is no longer required
    agency_id: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable(true)
      .when('first_nations_id', {
        is: (first_nations_id: number) => !first_nations_id,
        then: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('Required'),
        otherwise: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .nullable(true)
      }),
    // if first_nations_id is present, agency_id is no longer required
    first_nations_id: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable(true)
      .when('agency_id', {
        is: (agency_id: number) => !agency_id,
        then: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('Required'),
        otherwise: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .nullable(true)
      }),
    investment_action_category: yup.number().nullable(true),
    agency_project_id: yup.string().max(50, 'Cannot exceed 50 characters').nullable(true),
    // funding amount is not required when a first nation is selected as a funding source
    funding_amount: yup
      .number()
      .transform((value) => (isNaN(value) && null) || value)
      .typeError('Must be a number')
      .min(0, 'Must be a positive number')
      .max(9999999999, 'Must be less than $9,999,999,999')
      .when('first_nations_id', (val: any) => {
        const rules = yup
          .number()
          .transform((value) => (isNaN(value) && null) || value)
          .typeError('Must be a number')
          .min(0, 'Must be a positive number')
          .max(9999999999, 'Must be less than $9,999,999,999');
        if (!val) {
          return rules.required('Required');
        }

        return rules;
      }),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().isValidDateString().required('Required').isEndDateAfterStartDate('start_date')
  },
  [['agency_id', 'first_nations_id']] // this prevents a cyclical dependency
);

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

  const findItemLabel = (id: number, type: FundingSourceType) => {
    return props.sources.find((item) => item.value === id && item.type === type)?.label;
  };

  // find label for initial value
  const mapInitialValue = (
    formValues?: IProjectFundingFormArrayItem
  ): IAutocompleteFieldOptionWithType<number> | undefined => {
    if (formValues) {
      const initialValue = {
        value: formValues.agency_id ?? formValues.first_nations_id,
        label: '',
        type: formValues.agency_id ? FundingSourceType.FUNDING_SOURCE : FundingSourceType.FIRST_NATIONS
      } as IAutocompleteFieldOptionWithType<number>;

      initialValue.label = `${findItemLabel(initialValue.value, initialValue.type)}`;
      return initialValue;
    }
  };

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
                <FundingSourceAutocomplete
                  id="agency_id"
                  label={'Agency Name'}
                  options={props.sources}
                  initialValue={mapInitialValue(values)}
                  onChange={(event, options) => {
                    // investment_action_category is dependent on agency_id, so reset it if agency_id changes
                    setFieldValue(
                      'investment_action_category',
                      ProjectFundingFormArrayItemInitialValues.investment_action_category
                    );
                    // first_nations_id AND agency_id cannot be present on the same funding source
                    // reset values when a change occurs to prevent that from happening
                    setFieldValue('first_nations_id', null);
                    setFieldValue('agency_id', null);
                    setFieldValue('first_nations_name', null);
                    setFieldValue('agency_name', null);

                    if (options?.type === FundingSourceType.FIRST_NATIONS) {
                      setFieldValue('first_nations_id', options?.value);
                      setFieldValue('first_nations_name', options?.label);
                      setFieldValue('investment_action_category', 0); // first nations do not have an investment category
                    } else {
                      setFieldValue('agency_id', options?.value);
                      setFieldValue('agency_name', options?.label);
                      // If an agency_id with a `Not Applicable` investment_action_category is chosen, auto select
                      // it for the user.
                      if (event.target.value !== 1 && event.target.value !== 2) {
                        setFieldValue(
                          'investment_action_category',
                          props.investment_action_category.find((item) => item.fs_id === options?.value)?.value
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
            <DollarAmountField
              required={!formikProps.values.first_nations_id} // Funding amount is not a required field when a first nations source is selected
              id="funding_amount"
              name="funding_amount"
              label="Funding Amount"
            />
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
