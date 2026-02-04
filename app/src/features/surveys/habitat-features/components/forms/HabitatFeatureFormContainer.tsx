import { Stack } from '@mui/system';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Formik, FormikProps } from 'formik';
import yup from 'utils/YupSchema';
import { HabitatFeatureForm } from './HabitatFeatureForm';

// Habitat Feature Yup schema
const HabitatFeatureYupSchema = yup
  .object({
    habitat_feature_type_id: yup.number().required('Habitat feature type is required'),
    count: yup.number().required('Count is required'),
    latitude: yup
      .number()
      .nullable()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: yup
      .number()
      .nullable()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
    observed_date: yup.string().nullable(),
    observed_time: yup.string().nullable(),
    survey_sample_site_id: yup.number().nullable(),
    method_technique_id: yup.number().nullable(),
    survey_sample_period_id: yup.number().nullable(),
    survey_habitat_feature_taxons: yup.array().of(
      yup.object({
        itis_tsn: yup.number().required('ITIS TSN is required'),
        itis_scientific_name: yup.string().required('ITIS scientific name is required'),
        comment: yup.string().nullable()
      })
    )
  })
  .test('sampling', 'Invalid sampling information', function (_value) {
    const hasAnySamplingSelection = Boolean(
      _value.survey_sample_site_id || _value.method_technique_id || _value.survey_sample_period_id
    );

    if (!hasAnySamplingSelection) {
      return true;
    }

    const errors: yup.ValidationError[] = [];

    if (!_value.survey_sample_period_id) {
      errors.push(
        this.createError({
          path: this.path ? `${this.path}.survey_sample_period_id` : 'survey_sample_period_id',
          message: 'Sampling period is required when any sampling field is selected'
        })
      );
    }

    if (!_value.survey_sample_site_id) {
      errors.push(
        this.createError({
          path: this.path ? `${this.path}.survey_sample_site_id` : 'survey_sample_site_id',
          message: 'Sampling site is required when a sampling period is selected'
        })
      );
    }

    if (!_value.method_technique_id) {
      errors.push(
        this.createError({
          path: this.path ? `${this.path}.method_technique_id` : 'method_technique_id',
          message: 'Sampling technique is required when a sampling period is selected'
        })
      );
    }

    if (errors.length) {
      return new yup.ValidationError(errors);
    }

    return true;
  })
  .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
    if (!_value.survey_sample_period_id) {
      if (!_value.observed_date) {
        return this.createError({
          path: this.path ? `${this.path}.observed_date` : 'observed_date',
          message: 'Observed date or a sampling period must be provided'
        });
      }
    }
    return true;
  })
  .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
    if (!_value.survey_sample_period_id) {
      if (!_value.latitude) {
        return this.createError({
          path: this.path ? `${this.path}.latitude` : 'latitude',
          message: 'Latitude or a sampling period must be provided'
        });
      }
    }
    return true;
  })
  .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
    if (!_value.survey_sample_period_id) {
      if (!_value.longitude) {
        return this.createError({
          path: this.path ? `${this.path}.longitude` : 'longitude',
          message: 'Longitude or a sampling period must be provided'
        });
      }
    }
    return true;
  });

// Create Habitat Feature form values
export type CreateHabitatFeatureFormValues = {
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_site_id: number | null;
  method_technique_id: number | null;
  survey_sample_period_id: number | null;
  survey_habitat_feature_taxons: {
    itis_tsn: number;
    itis_scientific_name: string;
    comment: string | null;
  }[];
};

// Update Habitat Feature form values
export type UpdateHabitatFeatureFormValues = {
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_site_id: number | null;
  method_technique_id: number | null;
  survey_sample_period_id: number | null;
  survey_habitat_feature_taxons: {
    itis_tsn: number;
    itis_scientific_name: string;
    comment: string | null;
  }[];
};

// Habitat Feature form container props - either create or update
export interface IHabitatFeatureFormContainerProps<
  HabitatFeatureFormValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
> {
  initialData: HabitatFeatureFormValuesType;
  handleSubmit: (formikData: HabitatFeatureFormValuesType) => void;
  formikRef: React.RefObject<FormikProps<HabitatFeatureFormValuesType>>;
}

/**
 * Container for the Habitat Feature Form.
 *
 * @template HabitatFeatureFormType
 * @param {HabitatFeatureFormContainerProps<HabitatFeatureFormType>} props
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureFormContainer = <
  HabitatFeatureFormType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(
  props: IHabitatFeatureFormContainerProps<HabitatFeatureFormType>
) => {
  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialData}
      validationSchema={HabitatFeatureYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <>
        <Stack gap={5}>
          <FormikErrorSnackbar />
          <HabitatFeatureForm />
        </Stack>
        <FormikDevDebugger />
      </>
    </Formik>
  );
};
