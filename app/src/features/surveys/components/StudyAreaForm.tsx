import Box from '@mui/material/Box';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import yup from 'utils/YupSchema';

export interface ISurveyLocationForm {
  locations: {
    survey_location_id?: number;
    name: string;
    description: string;
    geojson: Feature[];
    revision_count?: number;
  }[];
}

export const SurveyLocationInitialValues: ISurveyLocationForm = {
  locations: [
    {
      survey_location_id: null as unknown as number,
      name: '',
      // TODO description is temporarily hardcoded until the new UI to populate this field is implemented in
      // https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-219
      description: 'Insert description here',
      geojson: [],
      revision_count: 0
    }
  ]
};

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

  const { handleSubmit } = formikProps;
  return (
    <form onSubmit={handleSubmit}>
      <Box mb={4}>
        <CustomTextField
          name={`locations[0].name`}
          label="Survey Area Name"
          other={{
            required: true
          }}
        />
      </Box>
      <MapBoundary
        name={`locations[0].geojson`}
        title="Study Area Boundary"
        mapId="study_area_form_map"
        bounds={undefined}
        formikProps={formikProps}
      />
    </form>
  );
};

export default StudyAreaForm;
