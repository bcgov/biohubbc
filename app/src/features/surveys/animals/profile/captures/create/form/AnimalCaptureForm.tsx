import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import CaptureGeneralInformationForm from './general-information/CaptureGeneralInformationForm';
import ReleaseGeneralInformationForm from './general-information/ReleaseGeneralInformationForm';
import CaptureLocationForm from './location/CaptureLocationForm';
import CaptureMeasurementsForm from './measurements/CaptureMeasurementsForm';
import CaptureMarkingsForm from './markings/CaptureMarkingsForm';

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
        <HorizontalSplitFormComponent
          title="Capture Location"
          summary="Enter where the animal was captured"
          component={<CaptureLocationForm />}
        />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the capture"
          component={<CaptureMeasurementsForm />}
        />
         <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the capture"
          component={<CaptureMarkingsForm />}
        />
        <HorizontalSplitFormComponent
          title="Release"
          summary="If the animal was released at a different location than where it was captured, enter information about the release."
          component={<ReleaseGeneralInformationForm />}
        />
        <Divider />
      </Stack>
    </Formik>
  );
};

export default AnimalCaptureForm;
