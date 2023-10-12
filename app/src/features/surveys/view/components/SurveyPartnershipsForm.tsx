import Grid from '@mui/material/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useContext, useEffect } from 'react';
import yup from 'utils/YupSchema';

export interface ISurveyPartnershipsForm {
  partnerships: {
    indigenous_partnerships: number[];
    stakeholder_partnerships: string[];
  };
}

export const SurveyPartnershipsFormInitialValues: ISurveyPartnershipsForm = {
  partnerships: {
    indigenous_partnerships: [],
    stakeholder_partnerships: []
  }
};

export const SurveyPartnershipsFormYupSchema = yup.object().shape({});

/**
 * Create/edit survey - Partnerships section
 *
 * @return {*}
 */
const SurveyPartnershipsForm = () => {
  const formikProps = useFormikContext<ISurveyPartnershipsForm>();

  const codesContext = useContext(CodesContext);

  const codes = codesContext.codesDataLoader.data;
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const { handleSubmit } = formikProps;

  const first_nations: IMultiAutocompleteFieldOption[] =
    codes?.first_nations?.map((item) => {
      return { value: item.id, label: item.name };
    }) || [];

  const stakeholder_partnerships: IMultiAutocompleteFieldOption[] =
    codes?.agency?.map((item) => {
      return { value: item.name, label: item.name };
    }) || [];

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'partnerships.indigenous_partnerships'}
            label={'Indigenous Partnerships'}
            options={first_nations}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'partnerships.stakeholder_partnerships'}
            label={'Other Partnerships'}
            options={stakeholder_partnerships}
            required={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default SurveyPartnershipsForm;
