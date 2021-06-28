import Grid from '@material-ui/core/Grid';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import MapBoundary from 'components/boundary/MapBoundary';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import CustomTextField from 'components/fields/CustomTextField';

export interface IStudyAreaForm {
  survey_area_name: string;
  park: string[];
  management_unit: string[];
  geometry: Feature[];
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  survey_area_name: '',
  park: [],
  management_unit: [],
  geometry: []
};

export const StudyAreaYupSchema = yup.object().shape({
  survey_area_name: yup.string().required('Required'),
  park: yup.array().of(yup.string()),
  management_unit: yup.array().of(yup.string())
});

export interface IStudyAreaFormProps {
  park: IMultiAutocompleteFieldOption[];
  management_unit: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - study area fields
 *
 * @return {*}
 */
const StudyAreaForm: React.FC<IStudyAreaFormProps> = (props) => {
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
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize id="park" label="Park" options={props.park} required={false} />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="management_unit"
            label="Management Unit"
            options={props.management_unit}
            required={false}
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
