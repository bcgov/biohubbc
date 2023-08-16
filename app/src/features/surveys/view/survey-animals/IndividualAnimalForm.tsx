import { Button, Typography } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
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
  const [devShow, setDevShow] = useState(false);

  useEffect(() => {
    // placeholder for when the form handles multiple animals.
    // waiting on direction from client, either displays all survey animals count
    // or count of animals in form
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

      {/* Temp development testing code -> remove before deployed */}
      {process.env.NODE_ENV === 'development' ? (
        <Button onClick={() => setDevShow((d) => !d)}>Display Form Values (Only Dev)</Button>
      ) : null}
      {devShow ? (
        <>
          <pre>{JSON.stringify({ form_values: values }, null, 2)}</pre>
          <pre>{JSON.stringify({ payload: new Critter(values) }, null, 2)}</pre>
        </>
      ) : null}
    </Form>
  );
};

export default IndividualAnimalForm;
