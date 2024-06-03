import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { MarkingsForm } from 'features/surveys/animals/profile/markings/MarkingsForm';
import { MeasurementsForm } from 'features/surveys/animals/profile/measurements/MeasurementsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import { CauseOfDeathForm } from './components/cause-of-death/CauseOfDeathForm';
import { MortalityGeneralInformationForm } from './components/general-information/MortalityGeneralInformationForm';
import { MortalityLocationForm } from './components/location/MortalityLocationForm';

export interface IAnimalMortalityFormProps {
  initialMortalityData: ICreateEditMortalityRequest;
  handleSubmit: (formikData: ICreateEditMortalityRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateEditMortalityRequest>>;
}

/**
 * Returns the formik component for creating and editing an animal mortality
 *
 * @param props
 * @returns
 */
export const AnimalMortalityForm = (props: IAnimalMortalityFormProps) => {
  const animalMortalityYupSchema = yup.object({
    mortality: yup.object({
      mortality_id: yup.string().nullable(),
      mortality_date: yup.string().required('Mortality date is required'),
      mortality_time: yup.string().nullable(),
      proximate_cause_of_death_id: yup.string().nullable().required('Cause of death is required'),
      mortality_comment: yup.string().required('Mortality comment is required'),
      mortality_location: yup
        .object()
        .shape({
          type: yup.string(),
          // Points may have 3 coords for [lon, lat, elevation]
          geometry: yup.object({
            type: yup.string(),
            coordinates: yup.array().of(yup.number()).min(2).max(3)
          }),
          properties: yup.object().optional()
        })
        .nullable()
        .default(undefined)
    }),
    measurements: yup.array(
      yup.object({
        // TODO
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
          summary="Enter where the animal was mortalityd"
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
