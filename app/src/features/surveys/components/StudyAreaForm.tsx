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
  locations: [
    // {
    //   survey_location_id: null as unknown as number,
    //   name: '',
    //   description: '',
    //   geojson: [],
    //   revision_count: 0
    // }
  ]
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
  const { handleSubmit, values } = formikProps;
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };
  const onSave = (data: { name: string; description: string }) => {
    console.log('ON SAVE');
  };

  const onDelete = () => {};

  return (
    <form onSubmit={handleSubmit}>
      <Box height={500}>
        <EditDialog
          dialogTitle={'Edit Location Details'}
          open={isOpen}
          dialogLoading={false}
          component={{
            element: <SurveyAreaLocationForm />,
            initialValues: {
              name: '',
              description: ''
            },
            validationSchema: SurveyLocationDetailsYupSchema
          }}
          dialogSaveButtonLabel="Update Location"
          onCancel={() => onClose()}
          onSave={(formValues) => {
            onSave(formValues);
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
          console.log(`Current Item Index: ${index}`);
          onOpen();
        }}
        openDelete={onDelete}
        data={values.locations}
      />
    </form>
  );
};

export default StudyAreaForm;
