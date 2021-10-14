import Grid from '@material-ui/core/Grid';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';

export interface IProjectLocationForm {
  location_description: string;
  geometry: Feature[];
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location_description: '',
  geometry: []
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location_description: yup.string().max(3000, 'Cannot exceed 3000 characters'),
  geometry: yup.array().min(1, 'You must specify a project boundary').required('You must specify a project boundary')
});

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm = () => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { values, handleSubmit, setFieldValue, errors } = formikProps;

  const [uploadError, setUploadError] = useState('');

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="location_description"
            label="Location Description"
            other={{ multiline: true, rows: 4 }}
          />
        </Grid>
        <MapBoundary
          title="Project Boundary"
          mapId="project_location_form_map"
          uploadError={uploadError}
          setUploadError={setUploadError}
          values={values}
          bounds={[]}
          errors={errors}
          setFieldValue={setFieldValue}
        />
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
