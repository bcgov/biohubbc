import Box from '@mui/material/Box';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import yup from 'utils/YupSchema';

export interface IStudyAreaForm {
  location: {
    name: string;
    description: string;
    geometry: Feature[];
  };
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  location: {
    name: '',
    // TODO description is temporarily hardcoded until the new UI to populate this field is implemented
    description: 'Insert description here',
    geometry: []
  }
};

export const StudyAreaYupSchema = yup.object().shape({
  location: yup.object().shape({
    name: yup.string().max(50, 'Name cannot exceed 50 characters').required('Name is Required'),
    description: yup.string().max(250, 'Description cannot exceed 250 characters').required('Description is Required'),
    geometry: yup.array().min(1, 'A geometry is required').required('A geometry is required')
  })
});

export interface ISurveyLocationForm {
  locations: {
    name: string;
    description: string;
    geometry: Feature[];
  }[];
}

export const SurveyLocationInitialValues: ISurveyLocationForm = {
  locations: []
};

export const SurveyLocationYupSchema = yup.object({
  locations: yup.array(
    yup.object({
      name: yup.string().max(50, 'Name cannot exceed 50 characters').required('Name is Required'),
      description: yup
        .string()
        .max(250, 'Description cannot exceed 250 characters')
        .required('Description is Required'),
      geometry: yup.array().min(1, 'A geometry is required').required('A geometry is required')
    })
  )
});

/**
 * Create survey - Study area section
 *
 * @return {*}
 */
const StudyAreaForm = () => {
  const formikProps = useFormikContext<IStudyAreaForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={4}>
        <CustomTextField
          name="location.name"
          label="Survey Area Name"
          other={{
            required: true
          }}
        />
      </Box>
      <MapBoundary
        name="location.geometry"
        title="Study Area Boundary"
        mapId="study_area_form_map"
        bounds={undefined}
        formikProps={formikProps}
      />
    </form>
  );
};

export default StudyAreaForm;
