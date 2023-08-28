import { Typography } from '@mui/material';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Form, useFormikContext } from 'formik';
import { useEffect } from 'react';
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
 * @params {IndividualAnimalFormProps}
 * @returns {*}
 *
 **/

interface IndividualAnimalFormProps {
  getAnimalCount: (num: number) => void;
}

const IndividualAnimalForm = ({ getAnimalCount }: IndividualAnimalFormProps) => {
  const { values } = useFormikContext<IAnimal>();

  useEffect(() => {
    // placeholder for when the form handles multiple animals.
    // waiting on direction from client, either displays all survey animals count
    // or count of animals in form
    getAnimalCount(values.general.taxon_id ? 1 : 0);
  }, [values.general.taxon_id, getAnimalCount]);

  return (
    <Form>
      <Typography variant="h4">Add New Individual</Typography>
      <GeneralAnimalForm />
      <CaptureAnimalForm />
      <MortalityAnimalForm />
      <MarkingAnimalForm />
      <MeasurementAnimalForm />
      <FamilyAnimalForm />

      <FormikDevDebugger custom_payload={new Critter(values)} />
    </Form>
  );
};

export default IndividualAnimalForm;
