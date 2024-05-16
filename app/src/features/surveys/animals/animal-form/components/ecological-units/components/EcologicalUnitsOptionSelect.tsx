import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

interface IEcologicalUnitsOptionSelectProps {
  /**
   * The label to display for the select field.
   *
   * @type {string}
   * @memberof IEcologicalUnitsOptionSelectProps
   */
  label: string;
  /**
   * List of options to display in the select field.
   *
   * @type {IAutocompleteFieldOption<string>[]}
   * @memberof IEcologicalUnitsOptionSelectProps
   */
  options: IAutocompleteFieldOption<string>[];
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof IEcologicalUnitsOptionSelectProps
   */
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) unit options for a given ecological unit.
 *
 * @param {IEcologicalUnitsOptionSelectProps} props
 * @return {*}
 */
export const EcologicalUnitsOptionSelect = (props: IEcologicalUnitsOptionSelectProps) => {
  const { label, options, index } = props;

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  return (
    <AutocompleteField
      id={`ecological_units.[${index}].collection_unit_id`}
      name={`ecological_units.[${index}].collection_unit_id`}
      label={label}
      options={options}
      onChange={(_, option) => {
        if (option?.value) {
          setFieldValue(`ecological_units.[${index}].collection_unit_id`, option.value);
        }
      }}
      disabled={Boolean(!values.ecological_units[index].collection_category_id)}
      required
      sx={{
        flex: '1 1 auto'
      }}
    />
  );
};
