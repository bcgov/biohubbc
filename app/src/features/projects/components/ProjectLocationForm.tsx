import Grid from '@material-ui/core/Grid';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectLocationForm {
  location: {
    location_description: string;
    geometry: Feature[];
  };
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    location_description: '',
    geometry: []
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    location_description: yup.string().max(3000, 'Cannot exceed 3000 characters'),
    geometry: yup.array().min(1, 'You must specify a project boundary').required('You must specify a project boundary')
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
      <Grid container spacing={3}>
        <MapBoundary
          name="location.geometry"
          title="Project Boundary *"
          mapId="project_location_form_map"
          bounds={[]}
          formikProps={formikProps}
        />
        <Grid item xs={12}>
          <CustomTextField
            name="location.location_description"
            label="Location Description"
            other={{ multiline: true, rows: 4 }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
