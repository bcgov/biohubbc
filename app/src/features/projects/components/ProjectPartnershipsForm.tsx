import Grid from '@material-ui/core/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectPartnershipsForm {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

export const ProjectPartnershipsFormInitialValues: IProjectPartnershipsForm = {
  indigenous_partnerships: [],
  stakeholder_partnerships: []
};

export const ProjectPartnershipsFormYupSchema = yup.object().shape({});

export interface IProjectPartnershipsFormProps {
  first_nations: IMultiAutocompleteFieldOption[];
  stakeholder_partnerships: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Partnerships section
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC<IProjectPartnershipsFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectPartnershipsForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'indigenous_partnerships'}
            label={'Indigenous Partnerships'}
            options={props.first_nations}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'stakeholder_partnerships'}
            label={'Other Partnerships'}
            options={props.stakeholder_partnerships}
            required={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectPartnershipsForm;
