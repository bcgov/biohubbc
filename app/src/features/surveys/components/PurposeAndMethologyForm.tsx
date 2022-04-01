//import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
//import Typography from '@material-ui/core/Typography';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
//import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
//import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethologyForm {
  intended_outcomes_id: number;
  additional_details: string;
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethologyForm = {
  intended_outcomes_id: ('' as unknown) as number,
  additional_details: ''
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    additional_details: yup.string(),
    intended_outcome: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide a purpose for the survey')
  });
};

export interface IGeneralInformationFormProps {
  intended_outcomes: IAutocompleteFieldOption<number>[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const PurposeAndMethologyForm: React.FC<IGeneralInformationFormProps> = (props) => {
  const formikProps = useFormikContext<IPurposeAndMethologyForm>();

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="intended_outcomes_id-label">Intended Outcomes</InputLabel>
            <Select
              id="intended_outcomes_id"
              name="intended_outcomes_id"
              labelId="intended_outcomes_id-label"
              label="Intended Outcomes"
              value={formikProps.values.intended_outcomes_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.intended_outcomes_id && Boolean(formikProps.errors.intended_outcomes_id)}
              displayEmpty
              inputProps={{ 'aria-label': 'Intended Outcomes' }}>
              {props.intended_outcomes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formikProps.touched.intended_outcomes_id && formikProps.errors.intended_outcomes_id}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name="additional_details"
          label="Additional Details"
          other={{ multiline: true, required: true, rows: 2 }}
        />
      </Grid>
    </form>
  );
};

export default PurposeAndMethologyForm;
