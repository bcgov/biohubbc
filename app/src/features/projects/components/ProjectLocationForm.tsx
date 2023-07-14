import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import yup from 'utils/YupSchema';

export interface IProjectLocationForm {
  location: {
    location_description: string;
    geometry: Feature[];
  };
}

export interface IProjectRegionsForm {
  regions: { region_ids: number[] };
}

export const ProjectRegionFormYupSchema = yup.object().shape({
  regions: yup.object().shape({
    region_ids: yup.array().of(yup.number())
  })
});

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    location_description: '',
    geometry: []
  }
};

// ProjectPartnershipsFormInitialValues
export const ProjectRegionFormInitialValues: IProjectRegionsForm = {
  regions: {
    region_ids: []
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    location_description: yup.string().max(3000, 'Cannot exceed 3000 characters'),
    geometry: yup.array().min(1, 'A project boundary is required').required('A project boundary is required')
  })
});

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm = () => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <MapBoundary
        name="location.geometry"
        title="Define Project Boundary"
        mapId="project_location_form_map"
        bounds={undefined}
        formikProps={formikProps}
      />
      <Box mt={4}>
        <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
          Describe the location of this project
        </Typography>
        <CustomTextField
          name="location.location_description"
          label="Location Description"
          other={{ multiline: true, rows: 4 }}
        />
      </Box>
    </form>
  );
};

export default ProjectLocationForm;
