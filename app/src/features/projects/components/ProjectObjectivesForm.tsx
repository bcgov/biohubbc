import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { FormikErrors, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import yup from 'utils/YupSchema';

export interface IProjectObjectivesForm {
  objectives: string;
  caveats: string;
}

export const ProjectObjectivesFormInitialValues: IProjectObjectivesForm = {
  objectives: '',
  caveats: ''
};

export const ProjectObjectivesFormYupSchema = yup.object().shape({
  objectives: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide objectives for the project'),
  caveats: yup.string().max(3000, 'Cannot exceed 3000 characters')
});

export interface IProjectObjectivesFormProps {
  handleValuesChange?: (
    values: any,
    formFieldIndex: number,
    validateForm: (values?: any) => Promise<FormikErrors<any>>
  ) => void;
}

/**
 * Create project - Objectives section
 *
 * @return {*}
 */
const ProjectObjectivesForm: React.FC<IProjectObjectivesFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectObjectivesForm>();

  const { values, touched, errors, handleChange, handleSubmit, validateForm } = formikProps;

  useEffect(() => {
    props.handleValuesChange && props.handleValuesChange(values, 3, validateForm);
  }, [values]);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="objectives"
            name="objectives"
            label="Objectives"
            multiline
            required={true}
            rows={4}
            fullWidth
            variant="outlined"
            value={values.objectives}
            onChange={handleChange}
            error={touched.objectives && Boolean(errors.objectives)}
            helperText={touched.objectives && errors.objectives}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            id="caveats"
            name="caveats"
            label="Caveats (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={values.caveats}
            onChange={handleChange}
            error={touched.caveats && Boolean(errors.caveats)}
            helperText={errors.caveats}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectObjectivesForm;
