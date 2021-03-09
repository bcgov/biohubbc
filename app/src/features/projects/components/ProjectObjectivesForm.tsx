import React from 'react';
import { Grid, TextField } from '@material-ui/core';
import { useFormikContext } from 'formik';
import * as yup from 'yup';

export interface IProjectObjectivesForm {
  objectives: string;
  caveats: string;
}

export const ProjectObjectivesFormInitialValues: IProjectObjectivesForm = {
  objectives: '',
  caveats: ''
};

export const ProjectObjectivesFormYupSchema = yup.object().shape({
  objectives: yup.string().required('You must provide objectives for the project.'),
  caveats: yup.string()
});

/**
 * Create project - Objectives section
 *
 * @return {*}
 */
const ProjectObjectivesForm = () => {
  const formikProps = useFormikContext<IProjectObjectivesForm>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

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
            helperText={errors.objectives}
            InputLabelProps={{
              shrink: true
            }}
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
            InputLabelProps={{
              shrink: true
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectObjectivesForm;
