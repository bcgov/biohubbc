import { Typography } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { Critter, IAnimal } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

interface IndividualAnimalFormProps {
  getAnimalCount: (num: number) => void;
}

/**
 * Renders The 'Individual Animals' Form displayed in Survey view
 * Note: Lots of conditionally rendered sections.
 *
 * params {IndividualAnimalFormProps}
 * returns {*}
 */

const IndividualAnimalForm = ({ getAnimalCount }: IndividualAnimalFormProps) => {
  const { values } = useFormikContext<IAnimal>();

  useEffect(() => {
    //placeholder for when the form handles multiple animals.
    getAnimalCount(values.general.taxon_id ? 1 : 0);
  }, [values.general.taxon_id]);

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
