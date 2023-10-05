import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { Form, useFormikContext } from 'formik';
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

const IndividualAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();

  return (
    <Form>
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
