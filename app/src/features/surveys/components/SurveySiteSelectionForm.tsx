import {  useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';
import { useContext } from 'react';
import { CodesContext } from 'contexts/codesContext';
import assert from 'assert';
import { useEffect } from 'react';
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
      .array()
      .of(yup.string() /* .required('Must select a valid site selection strategy') */ )
      .when('stratums', (stratums, schema) => {
        return stratums.length > 0
          ? schema.test(
              'allowsStratums',
              'You must include the Stratified site selection strategy in order to add Stratums.',
              (stratums: string[]) => stratums.includes('Stratified')
            )
          : schema;
      }),
    stratums: yup
      .array()
      .of(yup.object({
        survey_stratum_id: yup.number().optional(),
        name: yup.string().required('Must provide a name for stratum'),
        description: yup.string().optional(),
      }))
  })
});

interface ISurveySiteSelectionFormProps {
  onChangeStratumEntryVisibility: (isVisible: boolean) => void;
}

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveySiteSelectionForm = (props: ISurveySiteSelectionFormProps) => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleSubmit } = formikProps;

  const codesContext = useContext(CodesContext);
  assert(codesContext.codesDataLoader.data);

  const siteStrategies = codesContext.codesDataLoader.data.site_strategies.map((code) => {
    return { label: code.name, value: code.name };
  });

  useEffect(() => {
    if (values.site_selection_strategies.strategies.includes('Stratified')) {
      props.onChangeStratumEntryVisibility(true);
    } else if (values.site_selection_strategies.stratums.length === 0) {
      props.onChangeStratumEntryVisibility(false);
    }
  }, [values])

  return (
    <form onSubmit={handleSubmit}>
      <MultiAutocompleteFieldVariableSize
        id="site_selection_strategies.strategies"
        label="Site Selection Strategies"
        options={siteStrategies}
        required={false}
      />
    </form>
  );
};

export default SurveySiteSelectionForm;
