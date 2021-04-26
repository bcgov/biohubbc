import Grid from '@material-ui/core/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FormikErrors, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
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
  handleValuesChange?: (
    values: any,
    formFieldIndex: number,
    validateForm: (values?: any) => Promise<FormikErrors<any>>
  ) => void;
}

/**
 * Create project - Partnerships section
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC<IProjectPartnershipsFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectPartnershipsForm>();

  const { values, validateForm, handleSubmit } = formikProps;

  useEffect(() => {
    props.handleValuesChange && props.handleValuesChange(values, 8, validateForm);
  }, [values]);

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
            label={'Stakeholder Partnerships'}
            options={props.stakeholder_partnerships}
            required={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectPartnershipsForm;
