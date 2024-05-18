import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import CaptureMarkingsForm from '../../../captures/create/form/markings/CaptureMarkingsForm';
import AnimalMeasurementsForm from '../../../captures/create/form/measurements/CaptureMeasurementsForm';
import CauseOfDeathForm from './cause-of-death/CauseOfDeathForm';
import MortalityGeneralInformationForm from './general-information/MortalityGeneralInformationForm';
import MortalityLocationForm from './location/MortalityLocationForm';

export interface IAnimalMortalityFormProps {
  initialMortalityData: ICreateEditMortalityRequest;
  handleSubmit: (formikData: ICreateEditMortalityRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateEditMortalityRequest>>;
}

const AnimalMortalityForm = (props: IAnimalMortalityFormProps) => {
  const animalEditYupSchemas = yup.object({ nickname: yup.string() });

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialMortalityData}
      validationSchema={animalEditYupSchemas}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information about the mortality"
          component={<MortalityGeneralInformationForm />}
        />{' '}
        <Divider />
        <HorizontalSplitFormComponent
          title="Suspected Cause of Death"
          summary="Enter information about the suspected cause of death"
          component={<CauseOfDeathForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Mortality Location"
          summary="Enter where the animal was mortalityd"
          component={<MortalityLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the mortality"
          component={<AnimalMeasurementsForm formikName="measurements" />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the mortality"
          component={<CaptureMarkingsForm />}
        />
        <Divider />
      </Stack>
    </Formik>
  );
};

export default AnimalMortalityForm;
