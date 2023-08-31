import {  useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';
import { useContext } from 'react';
import { CodesContext } from 'contexts/codesContext';
import assert from 'assert';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';

interface IStratum {
  survey_stratum_id: number | undefined;
  name: string;
  description: string;
}

export interface ISurveySiteSelectionForm {
  site_selection_strategies: {
    strategies: string[];
    stratums: IStratum[];
  }
}

export const SurveySiteSelectionInitialValues: ISurveySiteSelectionForm = {
  site_selection_strategies: {
    strategies: ['Systematic'],
    stratums: [
      {
        survey_stratum_id: undefined,
        name: 'Stratum A',
        description: 'Hello world'
      }
    ]
  }
};


export const SurveySiteSelectionYupSchema = yup.object().shape({
  site_selection_strategies: yup.object().shape({
    strategies: yup
      .array(
        yup
          .string()
          .oneOf(['Stratified'], 'You must include the Stratified site selection strategy in order to add Stratums.')
          .required('Must select a valid site selection strategy')
      )
      .min(0),
    stratums: yup.array().when('site_strategies', (site_strategies, schema) => {
      return site_strategies.length > 1
        ? schema.required('You must include the Stratified site selection strategy in order to add Stratums.')
        : schema;
    }).of(
      yup.object({
        survey_stratum_id: yup.number().optional(),
        name: yup.string().required('Must provide a name for stratum'),
        description: yup.string().optional(),
      })
    )
  })
});


/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveySiteSelectionForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { handleSubmit } = formikProps;

  const codesContext = useContext(CodesContext);
  assert(codesContext.codesDataLoader.data);

  const siteStrategies = codesContext.codesDataLoader.data.site_strategies.map((code) => {
    return { label: code.name, value: code.name };
  });

  return (
    <form onSubmit={handleSubmit}>
      <MultiAutocompleteFieldVariableSize
        id="site_selection_strategies.strategies"
        label="Site Selection Strategies"
        options={siteStrategies}
        required={true}
      />
    </form>
  );
};

export default SurveySiteSelectionForm;
