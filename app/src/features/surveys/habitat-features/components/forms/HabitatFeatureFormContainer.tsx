import { Stack } from '@mui/system';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Formik, FormikProps } from 'formik';
import {
  CreateSurveyHabitatFeature,
  UpdateSurveyHabitatFeature
} from 'interfaces/useSurveyHabitatFeatureApi.interface';
import yup from 'utils/YupSchema';
import { HabitatFeatureForm } from './HabitatFeatureForm';

// Habitat Feature Yup schema
export const HabitatFeatureYupSchema = yup.object({
  habitat_feature_type_id: yup.number().required('Habitat feature type is required'),
  latitude: yup.number().min(-90).max(90).required('Latitude is required'),
  longitude: yup.number().min(-180).max(180).required('Longitude is required'),
  count: yup.number().required('Count is required'),
  observed_date: yup.string().required('Observed date is required'),
  observed_time: yup.string().required('Observed time is required')
});

// Create Habitat Feature form values
export type CreateHabitatFeatureFormValues = CreateSurveyHabitatFeature;

// Update Habitat Feature form values
export type UpdateHabitatFeatureFormValues = UpdateSurveyHabitatFeature;

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
