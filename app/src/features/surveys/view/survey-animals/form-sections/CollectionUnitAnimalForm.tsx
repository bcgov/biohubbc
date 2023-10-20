import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Fragment, useEffect } from 'react';
import { v4 } from 'uuid';
import {
  AnimalCollectionUnitSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalCollectionUnit,
  isRequiredInSchema,
  lastAnimalValueValid
} from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

const CollectionUnitAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();
  const { data: categoriesData, refresh } = useDataLoader(api.lookup.getSelectOptions);

  useEffect(() => {
    if (values.general.taxon_id) {
      refresh({ route: 'lookups/taxon-collection-categories', query: `taxon_id=${values.general.taxon_id}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.general.taxon_id]);

  const name: keyof IAnimal = 'collectionUnits';
  const newCollectionUnit = (): IAnimalCollectionUnit => ({
    _id: v4(),
    collection_unit_id: '',
    collection_category_id: '',
    critter_collection_unit_id: undefined
  });

  //Animals may have multiple collection units, but only one instance of each category.
  //We use this and pass to the select component to ensure categories already used in the form can't be selected again.
  const disabledCategories = values.collectionUnits.reduce((acc: Record<string, boolean>, curr) => {
    if (curr.collection_category_id) {
      acc[curr.collection_category_id] = true;
    }
    return acc;
  }, {});

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCollectionUnitTitle}
            titleHelp={SurveyAnimalsI18N.animalCollectionUnitHelp}
            addedSectionTitle={SurveyAnimalsI18N.animalCollectionUnitTitle2}
            btnLabel={SurveyAnimalsI18N.animalCollectionUnitAddBtn}
            disableAddBtn={
              !categoriesData?.length ||
              Object.keys(disabledCategories).length === categoriesData.length ||
              !lastAnimalValueValid('collectionUnits', values)
            }
            handleAddSection={() => push(newCollectionUnit())}
            handleRemoveSection={remove}>
            {values.collectionUnits.map((unit, index) => (
              <Fragment key={unit._id}>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Unit Category"
                    name={getAnimalFieldName<IAnimalCollectionUnit>(name, 'collection_category_id', index)}
                    id={'collection_category_id'}
                    disabledValues={disabledCategories}
                    query={`taxon_id=${values.general.taxon_id}`}
                    route={'lookups/taxon-collection-categories'}
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalCollectionUnitSchema, 'collection_category_id')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Unit Name"
                    id={'collection_unit_id'}
                    route={'lookups/collection-units'}
                    query={`category_id=${unit.collection_category_id}`}
                    name={getAnimalFieldName<IAnimalCollectionUnit>(name, 'collection_unit_id', index)}
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalCollectionUnitSchema, 'collection_unit_id')
                    }}
                  />
                </Grid>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default CollectionUnitAnimalForm;
