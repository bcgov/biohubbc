import { Stack } from '@mui/system';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Formik, FormikProps } from 'formik';
import yup from 'utils/YupSchema';
import { HabitatFeatureForm } from './HabitatFeatureForm';

// Habitat Feature Yup schema
export const HabitatFeatureYupSchema = yup.object({
  habitat_feature_type_id: yup.number().required('Habitat feature type is required'),
  count: yup.number().required('Count is required'),
  latitude: yup.number().min(-90).max(90).nullable(),
  longitude: yup.number().min(-180).max(180).nullable(),
  observed_date: yup.string().nullable(),
  observed_time: yup.string().nullable(),
  survey_sample_period_id: yup.number().nullable(),
  survey_habitat_feature_taxons: yup.array().of(
    yup.object({
      itis_tsn: yup.number().required('ITIS TSN is required'),
      itis_scientific_name: yup.string().required('ITIS scientific name is required'),
      comment: yup.string().nullable()
    })
  )
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
