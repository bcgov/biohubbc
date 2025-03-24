import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField'; // Import CustomTextField
import { useFormikContext } from 'formik';

export interface IDualAutocompleteUnitFieldProps<TUnit extends string | number> {
  /**
   * Label to display for the unit field.
   */
  unitLabel: string;
  /**
   * The options to display in the unit field.
   */
  unitOptions: { label: string; value: TUnit }[];
  /**
   * The data type of the category field.
   */
  categoryDataType: 'quantitative' | 'qualitative';
  /**
   * The formik field name for the unit field.
   */
  unitFormikFieldName: string;
}

/**
 * Returns an AutocompleteField or CustomTextField if the categoryDataType is qualitative or quantitative
 * respectively.
 *
 * @param {IDualAutocompleteUnitFieldProps} props
 * @return {*}
 */
export const DualAutocompleteUnitField = <TUnit extends string | number>(
  props: IDualAutocompleteUnitFieldProps<TUnit>
) => {
  const { unitLabel, unitOptions, categoryDataType, unitFormikFieldName } = props;

  const formik = useFormikContext<any>();

  if (categoryDataType === 'qualitative') {
    return (
      <AutocompleteField
        id={unitFormikFieldName}
        name={unitFormikFieldName}
        label={unitLabel}
        options={unitOptions}
        showValue
        onChange={(_, option) => {
          // Set the unit value
          formik.setFieldValue(unitFormikFieldName, option?.value ?? undefined);
        }}
        required
        sx={{ flex: 0.5 }}
      />
    );
  }

  return (
    <CustomTextField
      name={unitFormikFieldName}
      label={unitLabel}
      placeholder="Enter a value"
      maxLength={10}
      other={{
        type: 'number',
        sx: { flex: 0.5 }
      }}
    />
  );
};
