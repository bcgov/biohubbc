import assert from 'assert';
import YesNoDialog from 'components/dialog/YesNoDialog';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useState } from 'react';
import yup from 'utils/YupSchema';

export interface IStratum {
  survey_stratum_id?: number;
  name: string;
  description: string | null;
}

export interface ISurveySiteSelectionForm {
  site_selection: {
    strategies: string[];
    stratums: IStratum[];
  };
}

export const SurveySiteSelectionInitialValues: ISurveySiteSelectionForm = {
  site_selection: {
    strategies: [],
    stratums: []
  }
};

export const SurveySiteSelectionYupSchema = yup.object().shape({
  site_selection: yup.object().shape({
    strategies: yup
      .array()
      .of(yup.string() /* .required('Must select a valid site selection strategy') */)
      .when('stratums', (stratums: string[], schema: any) => {
        return stratums.length > 0
          ? schema.test(
              'allowsStratums',
              'You must include the Stratified site selection strategy in order to add Stratums.',
              (strategies: string[]) => strategies.includes('Stratified')
            )
          : schema;
      }),
    stratums: yup
      .array()
      .of(
        yup.object({
          survey_stratum_id: yup.number().optional(),
          name: yup.string().required('Must provide a name for stratum'),
          description: yup.string().optional()
        })
      )
      /*
      // TODO assure that duplicate stratums cannot be created
      .test('duplicateStratums', 'Stratums must have unique names.', (stratums) => {
        const entries = (stratums || []).map((stratum) => new String(stratum.name).trim());
        return new Set(entries).size === stratums?.length;
      })
      */
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
  const [showStratumDeleteConfirmModal, setShowStratumDeleteConfirmModal] = useState<boolean>(false);

  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, setFieldValue } = formikProps;

  const codesContext = useContext(CodesContext);
  assert(codesContext.codesDataLoader.data);

  const siteStrategies = codesContext.codesDataLoader.data.site_selection_strategies.map((code) => {
    return { label: code.name, value: code.name };
  });

  const handleConfirmDeleteAllStratums = () => {
    // Delete all Stratums and hide the Stratums form
    setFieldValue('site_selection.stratums', []);
    props.onChangeStratumEntryVisibility(false);
    setShowStratumDeleteConfirmModal(false);
  };

  const handleCancelDeleteAllStratums = () => {
    setShowStratumDeleteConfirmModal(false);
    setFieldValue('site_selection.strategies', [...values.site_selection.strategies, 'Stratified']);
  };

  useEffect(() => {
    if (values.site_selection.strategies.includes('Stratified')) {
      props.onChangeStratumEntryVisibility(true);
    } else if (values.site_selection.stratums.length > 0) {
      // Prompt to confirm removing all stratums
      setShowStratumDeleteConfirmModal(true);
    } else {
      props.onChangeStratumEntryVisibility(false);
    }
  }, [values]);

  return (
    <>
      <YesNoDialog
        dialogTitle="Delete Stratums?"
        dialogText="Removing the Stratified site selection strategy will delete all survey Stratums. Are you sure?"
        open={showStratumDeleteConfirmModal}
        onNo={handleCancelDeleteAllStratums}
        onClose={handleCancelDeleteAllStratums}
        onYes={handleConfirmDeleteAllStratums}
      />
      <MultiAutocompleteFieldVariableSize
        id="site_selection.strategies"
        label="Site Selection Strategies"
        options={siteStrategies}
        required={false}
      />
    </>
  );
};

export default SurveySiteSelectionForm;
