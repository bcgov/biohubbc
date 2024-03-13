import { Grid } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { IMarkingResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterMarkingSchema,
  ICreateCritterMarking,
  isRequiredInSchema
} from '../animal';

export const MarkingAnimalForm = (props: AnimalFormProps<IMarkingResponse>) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [loading, setLoading] = useState(false);

  const handleSave = async (values: ICreateCritterMarking) => {
    setLoading(true);
    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        await cbApi.marking.createMarking(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created marking.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        await cbApi.marking.updateMarking(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited marking.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter marking request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Marking' : 'Edit Marking'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      component={{
        initialValues: {
          marking_id: props?.formObject?.marking_id,
          critter_id: props?.critter.critter_id,
          marking_type_id: props?.formObject?.marking_type_id ?? '',
          taxon_marking_body_location_id: props?.formObject?.taxon_marking_body_location_id ?? '',
          primary_colour_id: props?.formObject?.primary_colour_id,
          secondary_colour_id: props?.formObject?.secondary_colour_id,
          marking_comment: props?.formObject?.marking_comment
        },
        validationSchema: CreateCritterMarkingSchema,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CbSelectField
                label="Type"
                name={'marking_type_id'}
                id="marking_type"
                route="lookups/marking-types"
                controlProps={{
                  size: 'medium',
                  required: isRequiredInSchema(CreateCritterMarkingSchema, 'marking_type_id')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CbSelectField
                label="Body Location"
                name={'taxon_marking_body_location_id'}
                id="marking_body_location"
                route="xref/taxon-marking-body-locations"
                query={{ tsn: props.critter.itis_tsn }}
                controlProps={{
                  size: 'medium',
                  required: isRequiredInSchema(CreateCritterMarkingSchema, 'taxon_marking_body_location_id')
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CbSelectField
                label="Primary Colour"
                name={'primary_colour_id'}
                id="primary_colour_id"
                route="lookups/colours"
                controlProps={{
                  size: 'medium',
                  required: isRequiredInSchema(CreateCritterMarkingSchema, 'primary_colour_id')
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CbSelectField
                label="Secondary Colour"
                name={'secondary_colour_id'}
                id="secondary_colour_id"
                route="lookups/colours"
                controlProps={{
                  size: 'medium',
                  required: isRequiredInSchema(CreateCritterMarkingSchema, 'secondary_colour_id')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                label="Comments"
                name={'marking_comment'}
                other={{
                  size: 'medium',
                  multiline: true,
                  minRows: 3,
                  required: isRequiredInSchema(CreateCritterMarkingSchema, 'marking_comment')
                }}
              />
            </Grid>
            <FormikDevDebugger />
          </Grid>
        )
      }}
    />
  );
};
