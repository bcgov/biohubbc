import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import CaptureGeneralInformationForm from './general-information/CaptureGeneralInformationForm';
import CaptureLocationForm from './location/CaptureLocationForm';
import ReleaseLocationForm from './location/ReleaseLocationForm';
import CaptureMarkingsForm from './markings/CaptureMarkingsForm';
import CaptureMeasurementsForm from './measurements/CaptureMeasurementsForm';

export interface IAnimalCaptureFormProps {
  initialCaptureData: ICreateCaptureRequest;
  handleSubmit: (formikData: ICreateCaptureRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateCaptureRequest>>;
}

const AnimalCaptureForm = (props: IAnimalCaptureFormProps) => {
  const animalEditYupSchemas = yup.object({ nickname: yup.string() });

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialCaptureData}
      validationSchema={animalEditYupSchemas}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information about the capture"
          component={<CaptureGeneralInformationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Capture Location"
          summary="Enter where the animal was captured"
          component={<CaptureLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Release Information"
          summary="Enter information about the release location"
          component={<ReleaseLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the capture"
          component={<CaptureMeasurementsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the capture"
          component={<CaptureMarkingsForm />}
        />
        <Divider />
      </Stack>
    </Formik>
  );
};

export default AnimalCaptureForm;
