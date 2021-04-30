import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IStudyAreaForm {
  survey_area_name: string;
  park: string;
  management_unit: string;
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  survey_area_name: '',
  park: '',
  management_unit: ''
};

export const StudyAreaYupSchema = yup.object().shape({
  survey_area_name: yup.string().required('Required'),
  park: yup.string().required('Required'),
  management_unit: yup.string().required('Required')
});

export interface IStudyAreaFormProps {
  park: string[];
  management_unit: string[];
}

/**
 * Create survey - study area fields
 *
 * @return {*}
 */
const StudyAreaForm: React.FC<IStudyAreaFormProps> = (props) => {
  const { values, touched, errors, handleChange, handleSubmit } = useFormikContext<IStudyAreaForm>();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required={true}
            id="survey_area_name"
            name="survey_area_name"
            label="Survey Area Name"
            variant="outlined"
            value={values.survey_area_name}
            onChange={handleChange}
            error={touched.survey_area_name && Boolean(errors.survey_area_name)}
            helperText={touched.survey_area_name && errors.survey_area_name}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="park"
            name="Park"
            label="Park"
            value={values.park}
            options={props.park}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="management_unit"
            name="Management Unit"
            label="Management Unit"
            value={values.management_unit}
            options={props.management_unit}
            required={true}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default StudyAreaForm;
