import Box from '@mui/material/Box';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import yup from 'utils/YupSchema';
import { SurveyAreaList } from './locations/SurveyAreaList';
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
  // const [updatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const { handleSubmit, values } = formikProps;
  return (
    <form onSubmit={handleSubmit}>
      {/* <MapBoundary
        name={`locations[0].geojson`}
        title="Study Area Boundary"
        mapId="study_area_form_map"
        bounds={updatedBounds}
        formikProps={formikProps}
      /> */}
      <Box height={500}>
        <SurveyAreaMapControl
          map_id={'study_area_map'}
          title="Study Area Boundary"
          formik_key="locations"
          formik_props={formikProps}
        />
      </Box>
      <SurveyAreaList title="Survey Study Area" isLoading={false} data={values.locations} />
    </form>
  );
};

export default StudyAreaForm;
