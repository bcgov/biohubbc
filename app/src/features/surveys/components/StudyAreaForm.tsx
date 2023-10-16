import Box from '@mui/material/Box';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useState } from 'react';
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
}
export interface ISurveyLocationForm {
  locations: ISurveyLocation[];
}

export const SurveyLocationInitialValues: ISurveyLocationForm = {
  locations: []
};

export const SurveyLocationDetailsYupSchema = yup.object({
  name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
  description: yup.string().max(250, 'Description cannot exceed 250 characters')
});

export const SurveyLocationYupSchema = yup.object({
  locations: yup.array(
    yup.object({
      name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
      description: yup.string().max(250, 'Description cannot exceed 250 characters'),
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
    data.splice(index, 1);

    // set values
    setFieldValue('locations', data);
  };

  const getDialogData = () => {
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box height={500}>
        <EditDialog
          dialogTitle={'Edit Location Details'}
          open={isOpen}
          dialogLoading={false}
          component={{
            element: <SurveyAreaLocationForm />,
            initialValues: getDialogData(),
            validationSchema: SurveyLocationDetailsYupSchema
          }}
          dialogSaveButtonLabel="Update Location"
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
          title="Study Area Boundary"
          formik_key="locations"
          formik_props={formikProps}
        />
      </Box>
      <SurveyAreaList
        title="Survey Study Area"
        isLoading={false}
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
