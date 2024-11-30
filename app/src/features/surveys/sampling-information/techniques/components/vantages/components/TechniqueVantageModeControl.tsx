import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import {
  CreateTechniqueFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { useFormikContext } from 'formik';
import { GetVantageReferenceRecord } from 'interfaces/useReferenceApi.interface';

interface ITechniqueVantageModeControlProps {
  selectedVantageReferenceRecord?: GetVantageReferenceRecord;
  index: number;
}

/**
 * Returns a form control for selecting a vantage mode.
 *
 * @template FormValues
 * @param {ITechniqueVantageModeControlProps} props
 * @return {*}
 */
export const TechniqueVantageModeControl = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueVantageModeControlProps
) => {
  const { selectedVantageReferenceRecord, index } = props;

  const { setFieldValue } = useFormikContext<FormValues>();

  if (!selectedVantageReferenceRecord) {
    return (
      <CustomTextField
        name={'_disabled_placeholder_field'}
        label="Value"
        other={{
          required: true,
          disabled: true,
          placeholder: 'Value'
        }}
      />
    );
  }

  // Return the qualitative attribute option select component
  return (
    <AutocompleteField
      id={`vantages.[${index}].vantage_mode_method_id`}
      name={`vantages.[${index}].vantage_mode_method_id`}
      label={'Value'}
      options={selectedVantageReferenceRecord.vantage_modes.map((option) => ({
        label: option.name,
        value: option.vantage_mode_method_id
      }))}
      onChange={(_, option) => {
        if (!option?.value) {
          return;
        }

        setFieldValue(`vantages.[${index}].vantage_mode_method_id`, option.value);
      }}
      required
      sx={{
        flex: '1 1 auto'
      }}
    />
  );
};
