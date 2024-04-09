import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';
import yup from 'utils/YupSchema';
import SpeciesStandardsAutocomplete from './components/SpeciesStandardsAutocomplete';

interface ISpeciesStandardsFormProps {
  handleSubmit: any;
}

interface ISpeciesStandardsFormikProps {
  tsn: string;
}

const SpeciesStandardsForm = (props: ISpeciesStandardsFormProps) => {
  const formikRef = useRef<FormikProps<ISpeciesStandardsFormikProps>>(null);

  const speciesStandardsYupSchema = yup.object({
    taxon: yup.string()
  });

  const speciesStandardsInitialValues = {
    tsn: ''
  };

  return (
    <>
      <Formik
        innerRef={formikRef}
        initialValues={speciesStandardsInitialValues}
        validationSchema={speciesStandardsYupSchema}
        validateOnBlur={false}
        validateOnChange={false}
        enableReinitialize={true}
        onSubmit={props.handleSubmit}>
        <SpeciesStandardsAutocomplete />
      </Formik>
    </>
  );
};

export default SpeciesStandardsForm;
