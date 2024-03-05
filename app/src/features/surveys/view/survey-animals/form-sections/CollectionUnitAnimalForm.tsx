import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import { useFormikContext } from 'formik';
import {
  AnimalCollectionUnitSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalCollectionUnit,
  isRequiredInSchema
} from '../animal';

interface ICollectionUnitAnimalFormContentProps {
  index: number;
}

export const CollectionUnitAnimalFormContent = ({ index }: ICollectionUnitAnimalFormContentProps) => {
  const name: keyof IAnimal = 'collectionUnits';

  const { values, setFieldValue } = useFormikContext<IAnimal>();
  //Animals may have multiple collection units, but only one instance of each category.
  //We use this and pass to the select component to ensure categories already used in the form can't be selected again.
  const disabledCategories = values.collectionUnits.reduce((acc: Record<string, boolean>, curr) => {
    if (curr.collection_category_id) {
      acc[curr.collection_category_id] = true;
    }
    return acc;
  }, {});

  const handleCategoryName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalCollectionUnit>(name, 'category_name', index), label);
  };

  const handleUnitName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalCollectionUnit>(name, 'unit_name', index), label);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CbSelectField
          label="Category"
          name={getAnimalFieldName<IAnimalCollectionUnit>(name, 'collection_category_id', index)}
          id={'collection_category_id'}
          disabledValues={disabledCategories}
          query={`itis_tsn=${values.general.itis_tsn}`}
          route={'lookups/taxon-collection-categories'}
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalCollectionUnitSchema, 'collection_category_id')
          }}
          handleChangeSideEffect={handleCategoryName}
        />
      </Grid>
      <Grid item xs={12}>
        <CbSelectField
          label="Name"
          id={'collection_unit_id'}
          route={'lookups/collection-units'}
          query={`category_id=${values.collectionUnits[index]?.collection_category_id}`}
          name={getAnimalFieldName<IAnimalCollectionUnit>(name, 'collection_unit_id', index)}
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalCollectionUnitSchema, 'collection_unit_id')
          }}
          handleChangeSideEffect={handleUnitName}
        />
      </Grid>
    </Grid>
  );
};

export default CollectionUnitAnimalFormContent;
