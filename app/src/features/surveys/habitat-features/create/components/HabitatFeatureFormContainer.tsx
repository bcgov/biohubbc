import { Stack } from '@mui/system';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { Formik, FormikProps } from 'formik';
import { CreateSurveyHabitatFeature, UpdateSurveyHabitatFeature } from 'interfaces/useSurveyHabitatFeature.interface';
import yup from 'utils/YupSchema';

// Habitat Feature Yup schema
export const HabitatFeatureYupSchema = yup.object({
  habitat_feature_type_id: yup.number().required('Habitat Feature Type is required'),
  survey_id: yup.number().required('Survey ID is required'),
  latitude: yup.number().min(-90).max(90).required('Latitude is required'),
  longitude: yup.number().min(-180).max(180).required('Longitude is required'),
  count: yup.number().required('Count is required'),
  observed_date: yup.string().required('Observed Date is required'),
  observed_time: yup.string().required('Observed Time is required')
});

// Create Habitat Feature form values
export type CreateHabitatFeatureFormValues = CreateSurveyHabitatFeature;

// Update Habitat Feature form values - includes the survey_habitat_feature_id
export type UpdateHabitatFeatureFormValues = UpdateSurveyHabitatFeature & {
  survey_habitat_feature_id: number;
};

// Habitat Feature form values - either create or update
export type HabitatFeatureFormValues = CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues;

// Habitat Feature form container props - either create or update
export interface IHabitatFeatureFormContainerProps<HabitatFeatureFormValuesType extends HabitatFeatureFormValues> {
  initialData: HabitatFeatureFormValuesType;
  handleSubmit: (formikData: HabitatFeatureFormValuesType) => void;
  formikRef: React.RefObject<FormikProps<HabitatFeatureFormValuesType>>;
}

/**
 * Container for the Habitat Feature Form.
 *
 * @template HabitatFeatureFormValues
 * @param {HabitatFeatureFormContainerProps<HabitatFeatureFormValues>} props
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureFormContainer = (props: IHabitatFeatureFormContainerProps<HabitatFeatureFormValues>) => {
  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialData}
      validationSchema={HabitatFeatureYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <></>
      </Stack>
    </Formik>
  );
};
