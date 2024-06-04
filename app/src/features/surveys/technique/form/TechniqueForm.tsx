import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import TechniqueAttractantsForm from './attractants/TechniqueAttractantsForm';
import TechniqueAttributesForm from './attributes/TechniqueAttributesForm';
import TechniqueDetailsForm from './details/TechniqueDetailsForm';
import TechniqueGeneralInformationForm from './general-information/TechniqueGeneralInformationForm';

interface ITechniqueFormProps {
  initialData: ICreateTechniqueRequest;
  handleSubmit: (formikData: ICreateTechniqueRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateTechniqueRequest>>;
}

const TechniqueForm = (props: ITechniqueFormProps) => {
  const { initialData, handleSubmit, formikRef } = props;

  // Try tracking state independent of formik to prevent re-renders
  const [selectedMethodLookupId, setSelectedMethodLookupId] = useState<number | null>(null);

  const techniqueYupSchema = yup.object({
    name: yup.string().required('Name is required.'),
    description: yup.string().nullable(),
    distance_threshold: yup.number().nullable(),
    method_lookup_id: yup.number().required('A method type is required.'),
    quantitative_attributes: yup.array(yup.object({ method_technique_attribute_quantitative_id: yup.string().uuid() })),
    qualitative_attributes: yup.array(yup.object({ method_technique_attribute_qualitative_id: yup.string().uuid() }))
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
          component={
            <TechniqueGeneralInformationForm setSelectedMethodLookupId={setSelectedMethodLookupId} />
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Details"
          summary="Enter additional information about the technique"
          component={
            <TechniqueAttributesForm selectedMethodLookupId={selectedMethodLookupId} />
          }></HorizontalSplitFormComponent>

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
