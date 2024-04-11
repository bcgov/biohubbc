import { Box } from '@mui/material';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';
import yup from 'utils/YupSchema';
import SpeciesStandardsResults from '../view/SpeciesStandardsResults';
import SpeciesStandardsAutocomplete from './components/SpeciesStandardsAutocomplete';

export interface ISpeciesStandardsFormikProps {
  tsn: number;
}

const SpeciesStandardsForm = () => {
  const formikRef = useRef<FormikProps<ISpeciesStandardsFormikProps>>(null);

  const speciesStandardsYupSchema = yup.object({
    taxon: yup.string()
  });

  const speciesStandardsInitialValues = {
    tsn: 0
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={speciesStandardsInitialValues}
      validationSchema={speciesStandardsYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={() => {}}>
      <Box>
        <SpeciesStandardsAutocomplete />
        <Box my={2}>
          <SpeciesStandardsResults />
        </Box>
      </Box>
    </Formik>
  );
};

export default SpeciesStandardsForm;
