import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectDraftForm {
  draft_name: string;
}

export const ProjectDraftFormInitialValues: IProjectDraftForm = {
  draft_name: ''
};

export const ProjectDraftFormYupSchema = yup.object().shape({
  draft_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required')
});

/**
 * Create Project - Draft form
 *
 * @return {*}
 */
const ProjectDraftForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectDraftForm>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required={true}
            id="draft_name"
            name="draft_name"
            label="Draft Name"
            variant="outlined"
            value={values.draft_name}
            onChange={handleChange}
            error={touched.draft_name && Boolean(errors.draft_name)}
            helperText={errors.draft_name}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectDraftForm;
