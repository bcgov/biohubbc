import Grid from '@mui/material/Grid';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import { Field, FieldProps } from 'formik';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICollectionUnitResponse } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash-es';
import { useState } from 'react';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterCollectionUnitSchema,
  ICreateCritterCollectionUnit,
  isRequiredInSchema
} from '../animal';

/**
 * This component renders a 'critter collection unit' create / edit dialog.
 *
 * @param {AnimalFormProps<ICollectionUnitResponse>} props - Generic AnimalFormProps.
 * @returns {*}
 */
export const CollectionUnitAnimalForm = (props: AnimalFormProps<ICollectionUnitResponse>) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();
  //Animals may have multiple collection units, but only one instance of each category.
  //We use this and pass to the select component to ensure categories already used in the form can't be selected again.
  const disabledCategories = props.critter.collection_units.reduce((acc: Record<string, boolean>, curr) => {
    if (curr.collection_category_id) {
      acc[curr.collection_category_id] = true;
    }
    return acc;
  }, {});

  const [loading, setLoading] = useState(false);

  const handleSave = async (values: ICreateCritterCollectionUnit) => {
    setLoading(true);
    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        await cbApi.collectionUnit.createCollectionUnit(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created ecological unit.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        await cbApi.collectionUnit.updateCollectionUnit(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited ecological unit.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter ecological unit request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Ecological Unit' : 'Edit Ecological Unit'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      component={{
        initialValues: {
          critter_collection_unit_id: props.formObject?.critter_collection_unit_id,
          critter_id: props.critter.critter_id,
          collection_unit_id: props.formObject?.collection_unit_id ?? '',
          collection_category_id: props.formObject?.collection_category_id ?? ''
        },
        validationSchema: CreateCritterCollectionUnitSchema,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CbSelectField
                label="Category"
                name={'collection_category_id'}
                id={'collection_category_id'}
                disabledValues={disabledCategories}
                query={{ tsn: props.critter.itis_tsn }}
                route={'xref/taxon-collection-categories'}
                controlProps={{
                  size: 'medium',
                  required: isRequiredInSchema(CreateCritterCollectionUnitSchema, 'collection_category_id')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Field name="collection_unit_id">
                {({ form }: FieldProps) => (
                  <CbSelectField
                    label="Name"
                    id={'collection_unit_id'}
                    route={`xref/collection-units/${get(form.values, 'collection_category_id')}`}
                    name={'collection_unit_id'}
                    controlProps={{
                      size: 'medium',
                      required: isRequiredInSchema(CreateCritterCollectionUnitSchema, 'collection_unit_id')
                    }}
                  />
                )}
              </Field>
            </Grid>
          </Grid>
        )
      }}
    />
  );
};

export default CollectionUnitAnimalForm;
