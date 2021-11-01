import Box from '@material-ui/core/Box';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import MapBoundary from 'components/boundary/MapBoundary';
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

  const [uploadError, setUploadError] = useState('');

  return (
    <form>
      <Box mb={4}>
        <CustomTextField
          name="survey_area_name"
          label="Survey Area Name"
          other={{
            required: true
          }}
        />
      </Box>
      <MapBoundary
        title="Study Area Boundary"
        mapId="study_area_form_map"
        uploadError={uploadError}
        setUploadError={setUploadError}
        values={values}
        bounds={[]}
        setFieldValue={setFieldValue}
      />
    </form>
  );
};

export default StudyAreaForm;
