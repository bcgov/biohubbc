import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import { useMemo, useState } from 'react';

/**
 * A generic component for rendering two autocomplete fields that are interdependent (category -> unit).
 *
 * @export
 * @interface IDualAutocompleteFieldProps
 * @template TCategory
 * @template TUnit
 * @template CategoryValueType
 * @template UnitValueType
 */
export interface IDualAutocompleteFieldProps<
  CategoryOptionsType extends IAutocompleteFieldOption<CategoryValueType>,
  UnitOptionsType extends IAutocompleteFieldOption<UnitValueType>,
  CategoryValueType extends string | number,
  UnitValueType extends string | number
> {
  /**
   * The formik field name for the category field.
   */
  categoryFormikFieldName: string;
  /**
   * Label to display for the category field.
   */
  categoryFieldLabel: string;
  /**
   * The options to display in the category field.
   */
  categoryOptions: CategoryOptionsType[];
  /**
   * Callback to get the data type of the category field.
   */
  getCategoryDataType: (categoryValue: CategoryValueType) => 'quantitative' | 'qualitative';
  /**
   * Get the formik field name for the unit field.
   */
  getUnitFormikFieldName: (categoryValue: CategoryValueType) => string;
  /**
   * Callback to get the options to display in the unit field, based on the selected category. Only called when a
   * category is selected and the category data type is qualitative.
   */
  getUnitOptions: (categoryValue: CategoryValueType) => UnitOptionsType[];
  /**
   * The options to display in the unit field, based on the selected category.
   *
   * If not provided, the default label for the unit field will be "Value".
   */
  getUnitFieldLabel?: (categoryValue: CategoryValueType) => string;
  /**
   * Callback fired when the delete button is clicked.
   */
  onDelete: () => void;
}

/**
 * Returns two autocomplete fields where the values for the second dropdown depend on the value of the first dropdown.
 * In this component, CATEGORY refers to the first dropdown and UNIT refers to the second dropdown.
 *
 * @template TCategory
 * @template TUnit
 * @template CategoryValueType
 * @template UnitValueType
 * @param {IDualAutocompleteFieldProps<TCategory, TUnit, CategoryValueType, UnitValueType>} props
 * @return {*}
 */
export const DualAutocompleteField = <
  TCategory extends IAutocompleteFieldOption<CategoryValueType>,
  TUnit extends IAutocompleteFieldOption<UnitValueType>,
  CategoryValueType extends string | number,
  UnitValueType extends string | number
>(
  props: IDualAutocompleteFieldProps<TCategory, TUnit, CategoryValueType, UnitValueType>
) => {
  const {
    categoryFormikFieldName,
    categoryFieldLabel,
    categoryOptions,
    getCategoryDataType,
    getUnitFormikFieldName,
    getUnitOptions,
    getUnitFieldLabel,
    onDelete
  } = props;
  const { values, setFieldValue } = useFormikContext<any>();

  const categoryValue: CategoryValueType | undefined = get(values, categoryFormikFieldName);

  // The category data type (quantitative or qualitative)
  const categoryDataType = categoryValue ? getCategoryDataType(categoryValue) : 'quantitative';

  // The label units field, which defaults to "Value" unless set with the getUnitAutocompleteLabel prop
  const [unitLabel, setUnitLabel] = useState<string>('Value');

  // The array of options for the unit field, if the category measurement type is qualitative.
  const unitOptions = useMemo(() => {
    if (!categoryValue) {
      // No category selected, so no units to display
      return [];
    }

    const availableUnits = getUnitOptions(categoryValue);

    // Update the label of the second dropdown if a custom label is provided
    if (getUnitFieldLabel) {
      const label = getUnitFieldLabel(categoryValue);
      setUnitLabel(label);
    }

    return availableUnits;
  }, [categoryValue, getUnitFieldLabel, getUnitOptions]);

  // The formik field name for the unit field
  const unitFormikFieldName = categoryValue ? getUnitFormikFieldName(categoryValue) : 'value';

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={categoryFormikFieldName}
        name={categoryFormikFieldName}
        label={categoryFieldLabel}
        options={categoryOptions}
        showValue
        required
        onChange={(_, option) => {
          if (!option) {
            // If the category value is cleared, clear the dependent unit value as well
            setFieldValue(unitFormikFieldName, undefined);
            setUnitLabel('Select a unit');
            return;
          }

          // Set the category value
          setFieldValue(categoryFormikFieldName, option.value);
        }}
        sx={{ flex: 0.5 }}
      />

      {categoryDataType === 'qualitative' ? (
        <AutocompleteField
          id={unitFormikFieldName}
          name={unitFormikFieldName}
          label={unitLabel}
          options={unitOptions}
          showValue
          onChange={(_, option) => {
            // Set the unit value
            setFieldValue(unitFormikFieldName, option?.value ?? undefined);
          }}
          required
          sx={{ flex: 0.5 }}
        />
      ) : (
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
      )}

      <IconButton data-testid="delete-button" title="Remove" aria-label="Remove" onClick={onDelete} sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
