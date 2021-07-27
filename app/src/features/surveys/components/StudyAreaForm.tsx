import Grid from '@material-ui/core/Grid';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import MapBoundary from 'components/boundary/MapBoundary';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';
import CustomTextField from 'components/fields/CustomTextField';

export interface IStudyAreaForm {
  survey_area_name: string;
  geometry: Feature[];
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  survey_area_name: '',
  geometry: []
};

export const StudyAreaYupSchema = yup.object().shape({
  survey_area_name: yup.string().required('Required')
});

/**
 * Create survey - study area fields
 *
 * @return {*}
 */
const StudyAreaForm = () => {
  const { values, setFieldValue } = useFormikContext<IStudyAreaForm>();

  const [bounds, setBounds] = useState<any>([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    updateMapBounds(values.geometry, setBounds);
  }, [values.geometry]);

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="survey_area_name"
            label="Survey Area Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <MapBoundary
          title="Study Area Boundary"
          mapId="study_area_form_map"
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

export default StudyAreaForm;
