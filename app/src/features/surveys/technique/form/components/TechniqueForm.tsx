import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { TechniqueAttributesForm } from 'features/surveys/technique/form/components/attributes/TechniqueAttributesForm';
import { Formik, FormikProps } from 'formik';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { TechniqueAttractantsForm } from './attractants/TechniqueAttractantsForm';
import { TechniqueDetailsForm } from './details/TechniqueDetailsForm';
import { TechniqueGeneralInformationForm } from './general-information/TechniqueGeneralInformationForm';

export type TechniqueAttributeFormValues =
  | {
      // internal ID used for form control. Not to be sent to API.
      _id?: string;
      // Primary key of the record. Will be null for new records.
      attribute_id: number | null;
      // Lookup Id
      attribute_lookup_id: string;
      attribute_value: string;
      attribute_type: 'qualitative'; // discriminator
    }
  | {
      // internal ID used for form control. Not to be sent to API.
      _id?: string;
      // Primary key of the record. Will be null for new records.
      attribute_id: number | null;
      // Lookup Id
      attribute_lookup_id: string;
      attribute_value: number;
      attribute_type: 'quantitative'; // discriminator
    };

/**
 * Interface for the values of the Technique form controls.
 */
export type TechniqueFormValues = Omit<ICreateTechniqueRequest, 'attributes'> & {
  // Extend the attributes field to include additional fields used only by the form controls
  attributes: TechniqueAttributeFormValues[];
};

interface ITechniqueFormProps {
  initialData: TechniqueFormValues;
  handleSubmit: (formikData: TechniqueFormValues) => void;
  formikRef: React.RefObject<FormikProps<TechniqueFormValues>>;
}

const TechniqueForm = (props: ITechniqueFormProps) => {
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
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information about the technique"
          component={<TechniqueGeneralInformationForm />}></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Details"
          summary="Enter additional information about the technique"
          component={<TechniqueAttributesForm />}></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Attractants"
          summary="Enter any attractants used to lure species during the technique"
          component={<TechniqueAttractantsForm />}></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Methodology"
          summary="Enter details about the technique"
          component={<TechniqueDetailsForm />}></HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default TechniqueForm;
