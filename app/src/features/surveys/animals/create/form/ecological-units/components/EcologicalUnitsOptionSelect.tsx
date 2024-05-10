import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

interface IEcologicalUnitsOptionSelectProps {
  index: number;
  label: string;
  options: IAutocompleteFieldOption<string>[];
}

const EcologicalUnitsOptionSelect = (props: IEcologicalUnitsOptionSelectProps) => {
  const { index, options, label } = props;

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  console.log(label)

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

export default EcologicalUnitsOptionSelect;
