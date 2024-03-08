import { Grid } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ANIMAL_FORM_MODE, CreateCritterMarkingSchema, ICritterMarking, isRequiredInSchema } from '../animal';
import { AnimalFormProps } from './animalForm';

/*
 * Note: This is a placeholder component for how to handle the form sections individually
 * allows easier management of the individual form sections with push / patch per form
 * vs how it's currently implemented with one large payload that updates/removes/creates critter meta
 */
export const MarkingAnimalForm = (props: AnimalFormProps<ICritterMarking>) => {
  const cbApi = useCritterbaseApi();

  return (
    <>
      <EditDialog
        dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Marking' : 'Edit Marking'}
        open={props.open}
        component={{
          element: <MarkingAnimalFormContent tsn={props.critter.itis_tsn} />,
          initialValues: {
            marking_id: props?.formObject?.marking_id, // undefined on ADD
            critter_id: props.critter.critter_id,
            marking_type_id: props?.formObject?.marking_type_id ?? '',
            taxon_marking_body_location_id: props?.formObject?.taxon_marking_body_location_id ?? '',
            primary_colour_id: props?.formObject?.primary_colour_id ?? '',
            secondary_colour_id: props?.formObject?.secondary_colour_id ?? '',
            marking_comment: props?.formObject?.marking_comment ?? ''
          },
          validationSchema: CreateCritterMarkingSchema
        }}
        onCancel={props.handleClose}
        onSave={async (values) => {
          if (props.formMode === ANIMAL_FORM_MODE.ADD) {
            await cbApi.marking.createMarking(values);
          }
          if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
            await cbApi.marking.updateMarking(values);
          }
          props.handleClose();
        }}
      />
    </>
  );
};

interface IMarkingAnimalFormContentProps {
  index?: number;
  tsn: number;
}

export const MarkingAnimalFormContent = ({ index, tsn }: IMarkingAnimalFormContentProps) => {
  return (
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
          query={{ tsn }}
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
  );
};
