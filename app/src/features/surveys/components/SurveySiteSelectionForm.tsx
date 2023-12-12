import assert from 'assert';
import YesNoDialog from 'components/dialog/YesNoDialog';
import MultiAutocompleteField from 'components/fields/MultiAutocompleteField';
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
      .required('Site Selection Strategy is required')
      .min(1, 'Site Selection Strategy is required')
      .of(yup.string())
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
      .test('duplicateStratums', 'Stratums must have unique names.', (stratums) => {
        const entries = (stratums || []).map((stratum) => String(stratum.name).trim());
        return new Set(entries).size === stratums?.length;
      })
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
  const selectedSiteStrategies = siteStrategies.filter((item) => values.site_selection.strategies.includes(item.value));

  const handleConfirmDeleteAllStratums = () => {
    // Delete all Stratums
    setFieldValue('site_selection.stratums', []);
    // Remove 'Stratified' from the list of selected strategies
    setFieldValue(
      'site_selection.strategies',
      values.site_selection.strategies.filter((item) => item !== 'Stratified')
    );
    // Hide Stratums form
    props.onChangeStratumEntryVisibility(false);
    // Close dialogue
    setShowStratumDeleteConfirmModal(false);
  };

  const handleCancelDeleteAllStratums = () => {
    // Close dialogue and do nothing
    setShowStratumDeleteConfirmModal(false);
  };

  useEffect(() => {
    if (values.site_selection.strategies.includes('Stratified')) {
      props.onChangeStratumEntryVisibility(true);
    } else {
      props.onChangeStratumEntryVisibility(false);
    }
  }, [props, values.site_selection.strategies]);

  return (
    <>
      <YesNoDialog
        dialogTitle="Remove all strata?"
        dialogText="Removing 'stratified' as a site selection strategy will remove all strata. Are you sure you want to proceed?"
        open={showStratumDeleteConfirmModal}
        onNo={handleCancelDeleteAllStratums}
        noButtonLabel="Cancel"
        noButtonProps={{
          color: 'primary'
        }}
        yesButtonLabel="Remove"
        yesButtonProps={{
          color: 'error'
        }}
        onClose={handleCancelDeleteAllStratums}
        onYes={handleConfirmDeleteAllStratums}
      />
      <MultiAutocompleteField
        id="site_selection.strategies"
        label="Site Selection Strategies"
        options={siteStrategies}
        selectedOptions={selectedSiteStrategies}
        required={true}
        onChange={(_, selectedOptions, reason) => {
          // If the user clicks to remove the 'Stratified' option and there are Stratums already defined, then show
          // a warning dialogue asking the user if they are sure they want to remove the option and delete the Stratums
          if (
            reason === 'removeOption' &&
            values.site_selection.strategies.includes('Stratified') &&
            !selectedOptions.map((item) => item.value).includes('Stratified') &&
            values.site_selection.stratums.length
          ) {
            setShowStratumDeleteConfirmModal(true);
            return;
          }

          // Update selected options
          setFieldValue(
            'site_selection.strategies',
            selectedOptions.map((item) => item.value)
          );
        }}
      />
    </>
  );
};

export default SurveySiteSelectionForm;
