import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';

interface IEcologicalUnitsOptionSelectProps {
  /**
   * Formik field name
   *
   * @type {string}
   * @memberof IEcologicalUnitsOptionSelectProps
   */
  name: string;
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
}

/**
 * Returns a component for selecting ecological (ie. collection) unit options for a given ecological unit.
 *
 * @param {IEcologicalUnitsOptionSelectProps} props
 * @return {*}
 */
export const EcologicalUnitsOptionSelect = (props: IEcologicalUnitsOptionSelectProps) => {
  const { label, options, name } = props;

  const { setFieldValue } = useFormikContext();

  return (
    <AutocompleteField
      id={name}
      name={name}
      label={label}
      options={options}
      onChange={(_, option) => {
        if (option?.value) {
          setFieldValue(name, option.value);
        }
      }}
      disabled={Boolean(!options.length)}
      required
      sx={{
        flex: '1 1 auto'
      }}
    />
  );
};
