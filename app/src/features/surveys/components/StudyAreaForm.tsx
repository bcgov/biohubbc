import EditDialog from 'components/dialog/EditDialog';
import { IDrawControlsRef } from 'components/map/components/DrawControls2';
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
  locations: yup.array(
    yup.object({
      name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
      description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
      geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
    })
  )
});

/**
 * Create survey - Study area section
 *
 * @return {*}
 */
const StudyAreaForm = () => {
  const formikProps = useFormikContext<ISurveyLocationForm>();
  const { handleSubmit, values, setFieldValue } = formikProps;
  const [isOpen, setIsOpen] = useState(false);
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

      <SurveyAreaMapControl
        map_id={'study_area_map'}
        formik_key="locations"
        formik_props={formikProps}
        draw_controls_ref={drawRef}
      />

      <SurveyAreaList
        openEdit={(index) => {
          setCurrentIndex(index);
          onOpen();
        }}
        openDelete={onDelete}
        data={values.locations}
      />
    </form>
  );
};

export default StudyAreaForm;
