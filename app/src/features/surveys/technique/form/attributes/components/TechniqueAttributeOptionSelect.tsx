import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';

interface ICaptureQualitativeMeasurementOptionSelectProps {
  /**
   * The label to display for the select field.
   *
   * @type {string}
   * @memberof ICaptureQualitativeMeasurementOptionSelectProps
   */
  label: string;
  /**
   * List of options to display in the select field.
   *
   * @type {IAutocompleteFieldOption<string>[]}
   * @memberof ICaptureQualitativeMeasurementOptionSelectProps
   */
  options: IAutocompleteFieldOption<string>[];
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof ICaptureQualitativeMeasurementOptionSelectProps
   */
  index: number;
  /**
   *
   */
  formikName: string;
}

/**
 * Returns a component for selecting ecological (ie. collection) unit options for a given ecological unit.
 *
 * @param {ICaptureQualitativeMeasurementOptionSelectProps} props
 * @return {*}
 */

const TechniqueAttributeOptionSelect = (props: ICaptureQualitativeMeasurementOptionSelectProps) => {
  const { label, options, index, formikName } = props;

  const { setFieldValue } = useFormikContext<ICreateTechniqueRequest>();

  return (
    <AutocompleteField
      id={`${formikName}.[${index}].method_lookup_attribute_quantitative_option_id`}
      name={`${formikName}.${index}].method_lookup_attribute_quantitative_option_id`}
      label={label}
      options={options}
      onChange={(_, option) => {
        if (option?.value) {
          setFieldValue(`${formikName}.[${index}].method_lookup_attribute_quantitative_option_id`, option.value);
        }
      }}
      required
      sx={{
        flex: '1 1 auto'
      }}
    />
  );
};

export default TechniqueAttributeOptionSelect;