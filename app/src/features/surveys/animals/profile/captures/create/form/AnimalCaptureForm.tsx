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

/**
 * Returns the formik component for creating and editing an animal capture
 *
 * @param props
 * @returns
 */
const AnimalCaptureForm = (props: IAnimalCaptureFormProps) => {
  const animalCaptureYupSchema = yup.object({
    capture: yup.object({
      capture_id: yup.string().nullable(),
      capture_date: yup.string().required('Capture date is required'),
      capture_comment: yup.string().required('Capture comment is required'),
      release_time: yup.string().nullable(),
      release_comment: yup.string().nullable(),
      capture_location: yup
        .object()
        .shape({
          type: yup.string(),
          // Points may have 3 coords for [lon, lat, elevation]
          geometry: yup.object({ type: yup.string().required(), coordinates: yup.array().of(yup.number()).min(2).max(3) }),
          properties: yup.object().optional()
        })
        .nullable()
        .default(undefined)
        .required('Capture location is required'),
      release_location: yup
        .array(
          yup.object({
            geojson: yup
              .array()
              .min(1, 'Release location is required if it is different from the capture location')
              .required('Release location is required if it is different from the capture location')
          })
        )
        .min(1, 'Release location is required if it is different from the capture location')
        .nullable()
    }),
    measurements: yup.object({ qualitative: yup.array(yup.object()), quantitative: yup.array(yup.object()) }),
    markings: yup.array(
      yup.object({
        marking_type_id: yup.string(),
        taxon_marking_body_location_id: yup.string(),
        identifier: yup.string(),
        primary_colour_id: yup.string().nullable(),
        secondary_colour_id: yup.string().nullable(),
        comment: yup.string().nullable()
      })
    )
  });

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialCaptureData}
      validationSchema={animalCaptureYupSchema}
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
          title="Markings"
          summary="Enter markings applied to the animal during the capture"
          component={<CaptureMarkingsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Capture Location"
          summary="Enter where the animal was captured"
          component={<CaptureLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the capture"
          component={<CaptureMeasurementsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Release Location"
          summary="Enter where the animal was released"
          component={<ReleaseLocationForm />}
        />
      </Stack>
    </Formik>
  );
};

export default AnimalCaptureForm;