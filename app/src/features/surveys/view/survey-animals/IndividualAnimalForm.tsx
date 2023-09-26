import { Typography } from '@mui/material';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Form, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { Critter, IAnimal } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
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

export enum ANIMAL_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

interface IndividualAnimalFormProps {
  getAnimalCount: (num: number) => void;
  critter_id?: string;
  mode: ANIMAL_FORM_MODE;
}

const IndividualAnimalForm = ({ getAnimalCount, critter_id, mode }: IndividualAnimalFormProps) => {
  const { values } = useFormikContext<IAnimal>();

  useEffect(() => {
    // placeholder for when the form handles multiple animals.
    // waiting on direction from client, either displays all survey animals count
    // or count of animals in form
    getAnimalCount(values.general.taxon_id ? 1 : 0);
  }, [values.general.taxon_id, getAnimalCount]);

  return (
    <Form>
      <Typography variant="h4">{mode === ANIMAL_FORM_MODE.ADD ? 'Add New Individual' : 'Edit Individual'}</Typography>
      {mode === ANIMAL_FORM_MODE.EDIT && (
        <Typography variant="body2" color={'textSecondary'}>
          Critter ID: {critter_id}
        </Typography>
      )}
      <GeneralAnimalForm />
      <CollectionUnitAnimalForm />
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
