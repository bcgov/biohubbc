import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import EditDialog from 'components/dialog/EditDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { createRef, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';
import { SurveyAreaList } from './locations/SurveyAreaList';
import SurveyAreaLocationForm from './locations/SurveyAreaLocationForm';
import { SurveyAreaMapControl } from './locations/SurveyAreaMapControl';

export interface ISurveyLocation {
  survey_location_id?: number;
  name: string;
  description: string;
  geojson: Feature[];
  revision_count?: number;
  // This is an id meant for the front end only. This is is set if the geojson was drawn by the user (on the leaflet map) vs imported (file upload or region selector)
  // Locations drawn by the user should be editable in the leaflet map using the draw tools available
  // Any uploaded or selected regions should not be editable and be placed in the 'static' layer on the map
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}
export interface ISurveyLocationForm {
  locations: ISurveyLocation[];
}

export const SurveyLocationInitialValues: ISurveyLocationForm = {
  locations: []
};

export const SurveyLocationDetailsYupSchema = yup.object({
  name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
  description: yup.string().max(250, 'Description cannot exceed 250 characters').default('')
});

export const SurveyLocationYupSchema = yup.object({
  locations: yup
    .array(
      yup.object({
        name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
        description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
        geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
      })
    )
    .min(1, 'At least one feature or boundary is required for a survey study area.')
});

/**
 * Create survey - Study area section
 *
 * @return {*}
 */
const StudyAreaForm = () => {
  const formikProps = useFormikContext<ISurveyLocationForm>();
  const { handleSubmit, values, setFieldValue, errors } = formikProps;
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(undefined);
  const drawRef = createRef<IDrawControlsRef>();
  const locationDialogFormData = useMemo(() => {
    // Initial Dialog Data
    const dialogData = {
      name: '',
      description: ''
    };

    if (currentIndex !== undefined) {
      dialogData.name = values.locations[currentIndex]?.name;
      dialogData.description = values.locations[currentIndex]?.description;
    }
    return dialogData;
  }, [currentIndex, values.locations]);

  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
    setCurrentIndex(undefined);
  };
  const onSave = (data: { name: string; description: string }) => {
    setFieldValue(`locations[${currentIndex}].name`, data.name);
    setFieldValue(`locations[${currentIndex}].description`, data.description);
  };

  const onDeleteAll = () => {
    // Use Draw Ref to remove editable layers from the map
    values.locations.forEach((item) => {
      if (item.leaflet_id) {
        drawRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    // set field to an empty array
    setFieldValue('locations', []);
  };

  const onDelete = (index: number) => {
    // remove the item at index
    const data = values.locations;
    const locationData = data.splice(index, 1);

    // Use Draw Ref to remove editable layer from the map
    locationData.forEach((item) => {
      if (item.leaflet_id) {
        drawRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    // set values
    setFieldValue('locations', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <YesNoDialog
        dialogTitle={`Remove all study areas?`}
        dialogText="Are you sure you want to remove all study areas?"
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Remove All'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={isDeleteOpen}
        onYes={() => {
          setIsDeleteOpen(false);
          onDeleteAll();
        }}
        onClose={() => setIsDeleteOpen(false)}
        onNo={() => setIsDeleteOpen(false)}
      />
      <EditDialog
        dialogTitle={'Edit Location Details'}
        open={isOpen}
        dialogLoading={false}
        component={{
          element: <SurveyAreaLocationForm />,
          initialValues: locationDialogFormData,
          validationSchema: SurveyLocationDetailsYupSchema
        }}
        dialogSaveButtonLabel="Save"
        onCancel={() => {
          onClose();
        }}
        onSave={(formValues) => {
          onSave(formValues);
          onClose();
        }}
      />

      <Stack gap={3}>
        {errors.locations && !Array.isArray(errors?.locations) && (
          <Alert severity="error" variant="outlined">
            <AlertTitle>Study Area Missing</AlertTitle>
            {errors.locations}
          </Alert>
        )}
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <SurveyAreaMapControl
            map_id={'study_area_map'}
            formik_key="locations"
            formik_props={formikProps}
            draw_controls_ref={drawRef}
            toggle_delete_dialog={setIsDeleteOpen}
          />

          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto'
            }}>
            <SurveyAreaList
              openEdit={(index) => {
                setCurrentIndex(index);
                onOpen();
              }}
              openDelete={onDelete}
              data={values.locations}
            />
          </Box>
        </Paper>
      </Stack>
    </form>
  );
};

export default StudyAreaForm;
