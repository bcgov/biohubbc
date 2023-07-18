import Box from '@mui/material/Box';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import yup from 'utils/YupSchema';

export interface IStudyAreaForm {
  location: {
    survey_area_name: string;
    geometry: Feature[];
  };
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  location: {
    survey_area_name: '',
    geometry: []
  }
};

export const StudyAreaYupSchema = yup.object().shape({
  location: yup.object().shape({
    survey_area_name: yup.string().required('Survey Area Name is Required'),
    geometry: yup.mixed()
  })
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
          name="location.survey_area_name"
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
