import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import MapBoundary from 'components/boundary/MapBoundary';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface IStudyAreaForm {
  survey_area_name: string;
  park: string;
  management_unit: string;
  geometry: Feature[];
}

export const StudyAreaInitialValues: IStudyAreaForm = {
  survey_area_name: '',
  park: '',
  management_unit: '',
  geometry: []
};

export const StudyAreaYupSchema = yup.object().shape({
  survey_area_name: yup.string().required('Required'),
  park: yup.string().required('Required'),
  management_unit: yup.string().required('Required')
});

export interface IStudyAreaFormProps {
  park: IAutocompleteFieldOption<string>[];
  management_unit: IAutocompleteFieldOption<string>[];
}

/**
 * Create survey - study area fields
 *
 * @return {*}
 */
const StudyAreaForm: React.FC<IStudyAreaFormProps> = (props) => {
  const { values, touched, errors, handleChange, setFieldValue } = useFormikContext<IStudyAreaForm>();

  const [bounds, setBounds] = useState<any>([]);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    updateMapBounds(values, setBounds);
  }, [values.geometry]);

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required={true}
            id="survey_area_name"
            name="survey_area_name"
            label="Survey Area Name"
            variant="outlined"
            value={values.survey_area_name}
            onChange={handleChange}
            error={touched.survey_area_name && Boolean(errors.survey_area_name)}
            helperText={touched.survey_area_name && errors.survey_area_name}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField id="park" name="park" label="Park" options={props.park} required={true} />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="management_unit"
            name="management_unit"
            label="Management Unit"
            options={props.management_unit}
            required={true}
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
