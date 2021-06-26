import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import {
  default as MultiAutocompleteFieldVariableSize,
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import Link from '@material-ui/core/Link';
import MapBoundary from 'components/boundary/MapBoundary';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';
import CustomTextField from 'components/fields/CustomTextField';

export interface IProjectLocationForm {
  regions: string[];
  location_description: string;
  geometry: Feature[];
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  regions: [],
  location_description: '',
  geometry: []
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  regions: yup.array().of(yup.string()).min(1, 'Required').required('Required'),
  location_description: yup.string().max(3000, 'Cannot exceed 3000 characters')
});

export interface IProjectLocationFormProps {
  region: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm: React.FC<IProjectLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { values, handleSubmit, setFieldValue } = formikProps;

  const [bounds, setBounds] = useState<any>([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    updateMapBounds(values.geometry, setBounds);
  }, [values.geometry]);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize id={'regions'} label={'Regions'} options={props.region} required={true} />
          <Box pt={2}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                window.open(
                  'https://www2.gov.bc.ca/gov/content/industry/forestry/managing-our-forest-resources/ministry-of-forests-lands-and-natural-resource-operations-region-district-contacts'
                );
              }}>
              Click here to view FLNRO map regions.
            </Link>
          </Box>
        </Grid>
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
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          uploadError={uploadError}
          setUploadError={setUploadError}
          values={values}
          bounds={bounds}
          setFieldValue={setFieldValue}
        />
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
