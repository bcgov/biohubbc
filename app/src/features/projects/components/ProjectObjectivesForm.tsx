import Grid from '@material-ui/core/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
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

/**
 * Create project - Objectives section
 *
 * @return {*}
 */
const ProjectObjectivesForm = () => {
  const formikProps = useFormikContext<IProjectObjectivesForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField name="objectives" label="Objectives" other={{ multiline: true, required: true, rows: 4 }} />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="caveats" label="Caveats (Optional)" other={{ multiline: true, rows: 4 }} />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectObjectivesForm;
