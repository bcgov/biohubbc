import { Box, Typography } from '@mui/material';
import React from 'react';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { AnimalSchema, IAnimal } from './animal';
import { Form, Formik } from 'formik';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';

/**
 * Renders The 'Individual Animals' Form displayed in Survey view
 * Note: Data handled by useAnimalFormData hook.
 * Lots of conditionally rendered sections.
 *
 * returns {*}
 */
export const AnimalFormValues: Partial<IAnimal> = {
  general: { taxon_id: '', taxon_label: '' },
  capture: [],
  marking: [],
  mortality: undefined,
  measurement: [],
  family: [],
  image: [],
  device: undefined
};

const IndividualAnimalForm = () => {
  return (
    <Formik
      initialValues={AnimalFormValues}
      validationSchema={AnimalSchema}
      onSubmit={async (values) => {
        console.log(values);
      }}>
      <Form>
        <Typography variant="h5">Add New Individual</Typography>
        <Box component="fieldset">
          <GeneralAnimalForm />
          <CaptureAnimalForm />
        </Box>
      </Form>
    </Formik>
  );
};

export default IndividualAnimalForm;
