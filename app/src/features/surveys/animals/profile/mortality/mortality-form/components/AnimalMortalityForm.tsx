import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { MarkingsForm } from 'features/surveys/animals/profile/markings/MarkingsForm';
import { MeasurementsForm } from 'features/surveys/animals/profile/measurements/MeasurementsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateMortalityRequest, IEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { CauseOfDeathForm } from './cause-of-death/CauseOfDeathForm';
import { MortalityGeneralInformationForm } from './general-information/MortalityGeneralInformationForm';
import { MortalityLocationForm } from './location/MortalityLocationForm';

export interface IAnimalMortalityFormProps<FormikValuesType extends ICreateMortalityRequest | IEditMortalityRequest> {
  initialMortalityData: FormikValuesType;
  handleSubmit: (formikData: FormikValuesType) => void;
  formikRef: React.RefObject<FormikProps<FormikValuesType>>;
}

/**
 * Returns the formik component for creating and editing an animal mortality
 *
 * @template FormikValuesType
 * @param {IAnimalMortalityFormProps<FormikValuesType>} props
 * @return {*}
 */
export const AnimalMortalityForm = <FormikValuesType extends ICreateMortalityRequest | IEditMortalityRequest>(
  props: IAnimalMortalityFormProps<FormikValuesType>
) => {
  const animalMortalityYupSchema = yup.object({
    mortality: yup.object({
      mortality_id: yup.string().nullable(),
      mortality_date: yup.string().required('Mortality date is required'),
      mortality_time: yup.string().nullable(),
      proximate_cause_of_death_id: yup.string().nullable().required('Cause of death is required'),
      mortality_comment: yup.string().required('Mortality comment is required'),
      location: yup
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
        .required('Mortality location is required')
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

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialMortalityData}
      validationSchema={animalMortalityYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information about the mortality"
          component={<MortalityGeneralInformationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Suspected Cause of Death"
          summary="Enter information about the suspected cause of death"
          component={<CauseOfDeathForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Mortality Location"
          summary="Enter where the animal was found"
          component={<MortalityLocationForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Markings"
          summary="Enter markings applied to the animal during the mortality"
          component={<MarkingsForm />}
        />
        <Divider />
        <HorizontalSplitFormComponent
          title="Measurements"
          summary="Enter measurements recorded during the mortality"
          component={<MeasurementsForm />}
        />
      </Stack>
    </Formik>
  );
};
