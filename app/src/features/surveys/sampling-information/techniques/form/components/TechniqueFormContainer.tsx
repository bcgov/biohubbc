import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { TechniqueForm } from 'features/surveys/sampling-information/techniques/form/components/TechniqueForm';
import { Formik, FormikProps } from 'formik';
import { ICreateTechniqueRequest, IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';

/**
 * Type of the values of the Technique Attribute form controls.
 */
export type TechniqueAttributeFormValues =
  | {
      // internal ID used for form control keys. Not to be sent to API.
      _id?: string;
      // Primary key of the record. Will be null for new records.
      attribute_id: number | null;
      // Lookup Id
      attribute_lookup_id: string;
      attribute_value: string;
      attribute_type: 'qualitative'; // discriminator
    }
  | {
      // internal ID used for form control keys. Not to be sent to API.
      _id?: string;
      // Primary key of the record. Will be null for new records.
      attribute_id: number | null;
      // Lookup Id
      attribute_lookup_id: string;
      attribute_value: number;
      attribute_type: 'quantitative'; // discriminator
    };

export type CreateTechniqueFormValues = Omit<ICreateTechniqueRequest, 'attributes'> & {
  // Overwrite the default attributes field to include additional fields used only by the form controls
  attributes: TechniqueAttributeFormValues[];
};

export type UpdateTechniqueFormValues = Omit<IGetTechniqueResponse, 'attributes'> & {
  // Overwrite the default attributes field to include additional fields used only by the form controls
  attributes: TechniqueAttributeFormValues[];
};

type ITechniqueFormProps<FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues> = {
  initialData: FormValues;
  handleSubmit: (formikData: FormValues) => void;
  formikRef: React.RefObject<FormikProps<FormValues>>;
};

/**
 * Container for the Technique Form.
 *
 * Handles formik state, validation, and submission.
 *
 * @param {ITechniqueFormProps} props
 * @return {*}
 */
const TechniqueFormContainer = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueFormProps<FormValues>
) => {
  const { initialData, handleSubmit, formikRef } = props;

  const techniqueYupSchema = yup.object({
    name: yup.string().required('Name is required.'),
    description: yup.string().nullable(),
    method_lookup_id: yup.number().required('A method type is required.'),
    attributes: yup.array(
      yup.object().shape({
        attribute_lookup_id: yup.string().required('Attribute type is required.'),
        attribute_value: yup.mixed().test('is-valid-attribute', 'Attribute value is required.', function (value) {
          const { attribute_type } = this.parent;

          if (!isDefined(value)) {
            return false;
          }

          if (attribute_type === 'qualitative') {
            // Field is qualitative, check if it is a string
            return yup.string().isValidSync(value);
          }

          // Field is quantitative, check if it is a number
          return yup.number().isValidSync(value);
        })
      })
    ),
    distance_threshold: yup.number().nullable()
  });

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialData}
      validationSchema={techniqueYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <TechniqueForm />
      </Stack>
    </Formik>
  );
};

export default TechniqueFormContainer;
