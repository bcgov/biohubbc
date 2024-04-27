import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import { Stack } from '@mui/system';
import EditDialog from 'components/dialog/EditDialog';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCaptureRequest, IMarkingPostData } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import MarkingCardContainer from './MarkingCardContainer';

const CaptureMarkingsForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const critterbaseApi = useCritterbaseApi();

  const { critterDataLoader } = useAnimalPageContext();

  const { values, setFieldValue } = useFormikContext<ICreateCaptureRequest>();

  const index = values.markings.length;

  // TODO: consolidate lookups into a single endpoint in critterbase
  const markingTypesDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingTypeOptions());
  const markingBodyLocationDataLoader = useDataLoader((tsn: number) =>
    critterbaseApi.marking.getMarkingBodyLocationOptions(tsn)
  );
  const markingColoursDataLoader = useDataLoader(() => critterbaseApi.marking.getMarkingColourOptions());

  if (!markingTypesDataLoader.data) {
    markingTypesDataLoader.load();
  }

  if (!markingColoursDataLoader.data) {
    markingColoursDataLoader.load();
  }

  if (!markingBodyLocationDataLoader.data) {
    if (critterDataLoader.data) {
      markingBodyLocationDataLoader.load(critterDataLoader.data.itis_tsn);
    }
  }

  const handleSave = (data: IMarkingPostData) => {
    setFieldValue(`markings.[${index}]`, data);
    setIsDialogOpen(false);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Marking'}
        open={isDialogOpen}
        onCancel={handleClose}
        onSave={handleSave}
        size="md"
        // dialogLoading={loading}
        component={{
          initialValues: {
            marking_type_id: '',
            taxon_marking_body_location_id: '',
            identifier: '',
            primary_colour_id: '',
            secondary_colour_id: null,
            comment: ''
          },
          validationSchema: yup.object({ marking_id: yup.string().optional() }), //CreateCritterMarkingSchema,
          element: (
            <Stack gap={2}>
              <AutocompleteField
                id="marking-type-autocomplete-field"
                label="Marking Type"
                loading={markingTypesDataLoader.isLoading}
                name={`marking_type_id`}
                options={
                  markingTypesDataLoader.data?.map((item) => ({
                    value: item.marking_type_id,
                    label: item.name
                  })) ?? []
                }
              />
              <AutocompleteField
                id="marking-location-autocomplete-field"
                label="Marking Placement"
                name={`body_location_id`}
                loading={markingBodyLocationDataLoader.isLoading}
                options={
                  markingBodyLocationDataLoader.data?.map((item) => ({
                    value: item.taxon_marking_body_location_id,
                    label: item.body_location
                  })) ?? []
                }
              />
              <AutocompleteField
                id="marking-primary-colour-autocomplete-field"
                label="Primary colour"
                name={`primary_colour_id`}
                loading={markingColoursDataLoader.isLoading}
                options={markingColoursDataLoader.data?.map((item) => ({ value: item.id, label: item.value })) ?? []}
              />
              <AutocompleteField
                id="marking-secondary-colour-autocomplete-field"
                label="Secondary colour"
                name={`secondary_colour_id`}
                loading={markingColoursDataLoader.isLoading}
                options={markingColoursDataLoader.data?.map((item) => ({ value: item.id, label: item.value })) ?? []}
              />
              <CustomTextField
                name={`comment`}
                label="Description"
                other={{ multiline: true, required: true, rows: 4 }}
              />
            </Stack>
          )
        }}
      />

      <MarkingCardContainer />

      <Button
        color="primary"
        variant="outlined"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add marking"
        onClick={() => setIsDialogOpen(true)}>
        Add Marking
      </Button>
    </>
  );
};

export default CaptureMarkingsForm;

// import Grid from '@mui/material/Grid';
// import EditDialog from 'components/dialog/EditDialog';
// import CbSelectField from 'components/fields/CbSelectField';
// import CustomTextField from 'components/fields/CustomTextField';
// import FormikDevDebugger from 'components/formik/FormikDevDebugger';
// import { useDialogContext } from 'hooks/useContext';
// import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
// import { IMarkingResponse } from 'interfaces/useCritterApi.interface';
// import { useState } from 'react';
// import {
//   AnimalFormProps,
//   ANIMAL_FORM_MODE,
//   CreateCritterMarkingSchema,
//   ICreateCritterMarking,
//   isRequiredInSchema
// } from '../animal';

// /**
//  * This component renders a 'critter marking' create / edit dialog.
//  *
//  * @param {AnimalFormProps<IMarkingResponse>} props - Generic AnimalFormProps.
//  * @returns {*}
//  */
// export const MarkingAnimalForm = (props: AnimalFormProps<IMarkingResponse>) => {
//   const cbApi = useCritterbaseApi();
//   const dialog = useDialogContext();

//   const [loading, setLoading] = useState(false);

//   const handleSave = async (values: ICreateCritterMarking) => {
//     setLoading(true);
//     try {
//       if (props.formMode === ANIMAL_FORM_MODE.ADD) {
//         await cbApi.marking.createMarking(values);
//         dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created marking.` });
//       }
//       if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
//         await cbApi.marking.updateMarking(values);
//         dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited marking.` });
//       }
//     } catch (err) {
//       dialog.setSnackbar({ open: true, snackbarMessage: `Critter marking request failed.` });
//     } finally {
//       props.handleClose();
//       setLoading(false);
//     }
//   };

//   return (
//     <EditDialog
//       dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Marking' : 'Edit Marking'}
//       open={props.open}
//       onCancel={props.handleClose}
//       onSave={handleSave}
//       size="md"
//       dialogLoading={loading}
//       component={{
//         initialValues: {
//           marking_id: props?.formObject?.marking_id,
//           critter_id: props?.critter.critter_id,
//           marking_type_id: props?.formObject?.marking_type_id ?? '',
//           taxon_marking_body_location_id: props?.formObject?.taxon_marking_body_location_id ?? '',
//           primary_colour_id: props?.formObject?.primary_colour_id,
//           secondary_colour_id: props?.formObject?.secondary_colour_id,
//           comment: props?.formObject?.comment
//         },
//         validationSchema: CreateCritterMarkingSchema,
//         element: (
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <CbSelectField
//                 label="Type"
//                 name={'marking_type_id'}
//                 id="marking_type"
//                 route="lookups/marking-types"
//                 controlProps={{
//                   size: 'medium',
//                   required: isRequiredInSchema(CreateCritterMarkingSchema, 'marking_type_id')
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <CbSelectField
//                 label="Body Location"
//                 name={'taxon_marking_body_location_id'}
//                 id="marking_body_location"
//                 route="xref/taxon-marking-body-locations"
//                 query={{ tsn: props.critter.itis_tsn }}
//                 controlProps={{
//                   size: 'medium',
//                   required: isRequiredInSchema(CreateCritterMarkingSchema, 'taxon_marking_body_location_id')
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <CbSelectField
//                 label="Primary Colour"
//                 name={'primary_colour_id'}
//                 id="primary_colour_id"
//                 route="lookups/colours"
//                 controlProps={{
//                   size: 'medium',
//                   required: isRequiredInSchema(CreateCritterMarkingSchema, 'primary_colour_id')
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <CbSelectField
//                 label="Secondary Colour"
//                 name={'secondary_colour_id'}
//                 id="secondary_colour_id"
//                 route="lookups/colours"
//                 controlProps={{
//                   size: 'medium',
//                   required: isRequiredInSchema(CreateCritterMarkingSchema, 'secondary_colour_id')
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <CustomTextField
//                 label="Comments"
//                 name={'comment'}
//                 other={{
//                   size: 'medium',
//                   multiline: true,
//                   minRows: 3,
//                   required: isRequiredInSchema(CreateCritterMarkingSchema, 'comment')
//                 }}
//               />
//             </Grid>
//             <FormikDevDebugger />
//           </Grid>
//         )
//       }}
//     />
//   );
// };
