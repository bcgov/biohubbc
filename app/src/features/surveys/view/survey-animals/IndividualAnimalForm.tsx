import { Box, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import { AnimalSchema, IAnimal } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

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
  mortality: [],
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
          <MortalityAnimalForm />
          <MarkingAnimalForm />
          <MeasurementAnimalForm />
          <FamilyAnimalForm />
        </Box>
      </Form>
    </Formik>
  );
};

export default IndividualAnimalForm;
