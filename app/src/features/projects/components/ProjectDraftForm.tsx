import Grid from '@material-ui/core/Grid';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import CustomTextField from 'components/fields/CustomTextField';

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

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="draft_name"
            label="Draft Name"
            other={{
              required: true
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectDraftForm;
