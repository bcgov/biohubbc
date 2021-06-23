import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

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

/**
 * Create project - Objectives section
 *
 * @return {*}
 */
const ProjectObjectivesForm = () => {
  const classes = useStyles();

  const formikProps = useFormikContext<IProjectObjectivesForm>();

  const { values, touched, errors, handleChange, handleSubmit, resetForm } = formikProps;

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
        <Grid item xs={12}>
          <Button variant="outlined" color="primary" onClick={() => resetForm()} className={classes.actionButton}>
            Clear
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectObjectivesForm;
