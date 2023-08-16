import { Typography } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import React from 'react';
import { Critter, IAnimal } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

/**
 * Renders The 'Individual Animals' Form displayed in Survey view
 * Note: Lots of conditionally rendered sections.
 *
 * returns {*}
 */

const IndividualAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  return (
    <Form>
      <Typography variant="h4">Add New Individual</Typography>
      <GeneralAnimalForm />
      <CaptureAnimalForm />
      <MortalityAnimalForm />
      <MarkingAnimalForm />
      <MeasurementAnimalForm />
      <FamilyAnimalForm />
      <pre>{JSON.stringify({ form_values: values }, null, 2)}</pre>
      <pre>{JSON.stringify({ payload: new Critter(Object.assign({}, values)) }, null, 2)}</pre>
    </Form>
  );
};

export default IndividualAnimalForm;
