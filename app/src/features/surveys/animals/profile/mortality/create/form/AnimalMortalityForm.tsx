import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateMortalityRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import MortalityGeneralInformationForm from './general-information/MortalityGeneralInformationForm';
import MortalityLocationForm from './location/MortalityLocationForm';
import CauseOfDeathForm from './cause-of-death/CauseOfDeathForm';

export interface IAnimalMortalityFormProps {
  initialMortalityData: ICreateMortalityRequest;
  handleSubmit: (formikData: ICreateMortalityRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateMortalityRequest>>;
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
        {/* <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the mortality"
          component={<MortalityMeasurementsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the mortality"
          component={<MortalityMarkingsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Release Location"
          summary="Enter where the animal was released"
          component={<ReleaseLocationForm />}
        />  */}
      </Stack>
    </Formik>
  );
};

export default AnimalMortalityForm;
