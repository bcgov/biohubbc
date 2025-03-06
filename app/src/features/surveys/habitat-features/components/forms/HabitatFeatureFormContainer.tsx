import { Stack } from '@mui/system';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Formik, FormikProps } from 'formik';
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
export type CreateHabitatFeatureFormValues = {
  habitat_feature_type_id: number;
  latitude: number;
  longitude: number;
  count: number;
  observed_date: string;
  observed_time: string;
  survey_habitat_feature_taxons: Array<{
    itis_tsn: number;
    itis_scientific_name: string;
    comment: string;
    // Additional taxon metadata for form display
    commonNames: string[];
    rank: string;
    kingdom: string;
  }>;
};

// Update Habitat Feature form values
export type UpdateHabitatFeatureFormValues = {
  habitat_feature_type_id: number;
  latitude: number;
  longitude: number;
  count: number;
  observed_date: string;
  observed_time: string;
  survey_habitat_feature_taxons: Array<{
    survey_habitat_feature_taxon_id: number;
    itis_tsn: number;
    itis_scientific_name: string;
    comment: string;
    // Additional taxon metadata for form display
    commonNames: string[];
    rank: string;
    kingdom: string;
  }>;
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
