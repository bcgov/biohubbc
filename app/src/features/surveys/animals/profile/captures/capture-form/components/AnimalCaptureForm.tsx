import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import {
  ICreateCaptureRequest,
  ICritterCaptureAttachment,
  IEditCaptureRequest
} from 'interfaces/useCritterApi.interface';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { AnimalAttachments } from '../../../attachments/AnimalAttachments';
import { MarkingsForm } from '../../../markings/MarkingsForm';
import { MeasurementsForm } from '../../../measurements/MeasurementsForm';
import { CaptureGeneralInformationForm } from './general-information/CaptureGeneralInformationForm';
import { CaptureLocationForm } from './location/CaptureLocationForm';
import { ReleaseLocationForm } from './location/ReleaseLocationForm';

export interface IAnimalCaptureFormProps<FormikValuesType extends ICreateCaptureRequest | IEditCaptureRequest> {
  initialCaptureData: FormikValuesType;
  handleSubmit: (formikData: FormikValuesType) => void;
  formikRef: React.RefObject<FormikProps<FormikValuesType>>;
  captureAttachments?: ICritterCaptureAttachment[];
}

/**
 * Returns the formik component for creating and editing an animal capture
 *
 * @template FormikValuesType
 * @param {IAnimalCaptureFormProps<FormikValuesType>} props
 * @return {*}
 */
export const AnimalCaptureForm = <FormikValuesType extends ICreateCaptureRequest | IEditCaptureRequest>(
  props: IAnimalCaptureFormProps<FormikValuesType>
) => {
  const animalCaptureYupSchema = yup.object({
    attachments: yup.object({
      capture_attachments: yup.object({
        create: yup.mixed(),
        delete: yup.array().of(yup.number())
      })
    }),
    capture: yup.object({
      capture_id: yup.string(),
      capture_date: yup.string().required('Capture date is required'),
      capture_time: yup.string().nullable(),
      capture_comment: yup.string().required('Capture comment is required'),
      release_date: yup.string().nullable(),
      release_time: yup.string().nullable(),
      release_comment: yup.string().nullable(),
      capture_location: yup
        .object()
        .shape({
          type: yup.string(),
          // Points may have 3 coords for [lon, lat, elevation]
          geometry: yup.object({
            type: yup.string(),
            coordinates: yup
              .array()
              .of(yup.number())
              .min(2)
              .max(3)
              .isValidPointCoordinates('Latitude or longitude values are outside of the valid range.')
              .required('Latitude or longitude values are outside of the valid range.')
          }),
          properties: yup.object().optional()
        })
        .nullable()
        .default(undefined)
        .required('Capture location is required'),
      release_location: yup
        .object()
        .shape({
          type: yup.string(),
          // Points may have 3 coords for [lon, lat, elevation]
          geometry: yup.object({
            type: yup.string(),
            coordinates: yup
              .array()
              .of(yup.number())
              .min(2)
              .max(3)
              .isValidPointCoordinates('Latitude or longitude values are outside of the valid range.')
              .required('Latitude or longitude values are outside of the valid range.')
          }),
          properties: yup.object().optional()
        })
        .nullable()
        .default(undefined)
    }),
    measurements: yup.array(
      yup
        .object()
        .shape({
          taxon_measurement_id: yup.string().required('Measurement type is required.'),
          value: yup.mixed().test('is-valid-measurement', 'Measurement value is required.', function () {
            const { value } = this.parent;
            if (isDefined(value)) {
              // Field value is defined, check if it is valid
              return yup.number().isValidSync(value);
            }
            // Field value is not defined, return valid for now
            return true;
          }),
          qualitative_option_id: yup
            .mixed()
            .test('is-valid-measurement', 'Measurement value is required.', function () {
              const { qualitative_option_id } = this.parent;
              if (isDefined(qualitative_option_id)) {
                // Field value is defined, check if it is valid
                return yup.string().isValidSync(qualitative_option_id);
              }
              // Field value is not defined, return valid for now
              return true;
            })
        })
        .test('is-valid-measurement', 'Measurement must have a type and a value', function (_value) {
          const { taxon_measurement_id } = _value;
          const path = this.path;
          if (taxon_measurement_id && !isDefined(_value.value) && !isDefined(_value.qualitative_option_id)) {
            // Measurement type is defined but neither value nor qualitative option is defined, add errors for both
            const errors = [
              this.createError({
                path: `${path}.qualitative_option_id`,
                message: 'Measurement value is required.'
              }),
              this.createError({
                path: `${path}.value`,
                message: 'Measurement value is required.'
              })
            ];
            return new yup.ValidationError(errors);
          }
          // Field value is not defined, return valid
          return true;
        })
    ),
    markings: yup.array(
      yup.object({
        marking_type_id: yup.string().required('Marking type is required.'),
        taxon_marking_body_location_id: yup.string().required('Marking body location is required.'),
        identifier: yup.string().nullable(),
        primary_colour_id: yup.string().nullable(),
        secondary_colour_id: yup.string().nullable(),
        comment: yup.string().nullable()
      })
    )
  });

  /**
   * Add the file to the create attachments list. (Create)
   *
   * @param {File | null} file - Uploaded file
   * @return {void}
   */
  const addStagedFile = (file: File | null) => {
    if (!file) return;

    props.formikRef.current?.setFieldValue(`attachments.capture_attachments.create[${file.name}]`, file);
  };

  /**
   * Remove a staged file. (Create)

   * @param {string} fileName
   * @return {void}
   */
  const removeStagedFile = (fileName: string) => {
    props.formikRef.current?.setFieldValue(`attachments.capture_attachments.create[${fileName}]`, undefined);
  };

  /**
   * Flag uploaded file for delete. (Edit)
   *
   * @param {number} attachmentId
   * @return {void}
   */
  const flagUploadedFileForDelete = (attachmentId: number) => {
    const deleteIds = props.formikRef.current?.values.attachments.capture_attachments.delete ?? [];

    // If the attachment is not already flagged for deletion, add it to the list
    if (!deleteIds.includes(attachmentId)) {
      props.formikRef.current?.setFieldValue(`attachments.capture_attachments.delete`, [...deleteIds, attachmentId]);
    }
  };

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
          title="Capture Location"
          summary="Enter where the animal was captured"
          component={<CaptureLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Attachments"
          summary="Upload attachments related to the capture"
          component={
            <>
              <AnimalAttachments
                attachments={props.captureAttachments?.map((attachment) => ({
                  id: attachment.critter_capture_attachment_id,
                  s3Key: attachment.key,
                  name: attachment.file_name ?? 'Unknown',
                  size: attachment.file_size,
                  type: attachment.file_type
                }))}
                onStagedAttachment={addStagedFile}
                onRemoveStagedAttachment={removeStagedFile}
                onRemoveUploadedAttachment={flagUploadedFileForDelete}
              />
            </>
          }
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the capture"
          component={<MarkingsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the capture"
          component={<MeasurementsForm />}
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
