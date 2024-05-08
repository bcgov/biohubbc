import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

interface IEcologicalUnitsOptionSelectProps {
  index: number;
  collection_category_id: string;
  unit_label: string;
}

const EcologicalUnitsOptionSelect = (props: IEcologicalUnitsOptionSelectProps) => {
  const { index, collection_category_id, unit_label } = props;
  const critterbaseApi = useCritterbaseApi();

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  const ecologicalUnitOptionDataLoader = useDataLoader((collection_category_id: string) =>
    critterbaseApi.xref.getCollectionUnitOptions(collection_category_id)
  );

  if (!ecologicalUnitOptionDataLoader.data && collection_category_id) {
    ecologicalUnitOptionDataLoader.load(collection_category_id);
  }

  const options =
    ecologicalUnitOptionDataLoader.data?.map((option) => ({
      value: option.collection_unit_id,
      label: option.unit_name
    })) ?? [];

  return (
    <AutocompleteField
      id={`ecological_units.[${index}].collection_unit_id`}
      name={`ecological_units.[${index}].collection_unit_id`}
      label={unit_label}
      options={options}
      onChange={(_, option) => {
        console.log(option);
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
