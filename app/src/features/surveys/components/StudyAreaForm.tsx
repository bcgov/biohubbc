import Box from '@material-ui/core/Box';
import MapBoundary from 'components/boundary/MapBoundary';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React from 'react';
import yup from 'utils/YupSchema';

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
  const formikProps = useFormikContext<IStudyAreaForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
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
        name="geometry"
        title="Study Area Boundary"
        mapId="study_area_form_map"
        bounds={[]}
        formikProps={formikProps}
      />
    </form>
  );
};

export default StudyAreaForm;
