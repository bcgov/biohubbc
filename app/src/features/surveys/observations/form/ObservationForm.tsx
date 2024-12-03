import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { IObservationForm } from 'features/surveys/observations/form/ObservationForm.interface';
import { Formik, FormikProps } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import { ObservationCommentForm } from './comment/ObservationCommentForm';
import ObservationDateTimeForm from './date/ObservationDateTimeForm';
import { ObservationEnvironmentForm } from './environments/ObservationEnvironmentForm';
import ObservationLocationForm from './location/ObservationLocationForm';
import ObservationSamplingForm from './sampling/ObservationSamplingForm';
import ObservationSpeciesForm from './species/ObservationSpeciesForm';
import { SubcountForm } from './subcounts/SubcountForm';

// Define the validation schema for each subcount
export const subcountValidationSchema = yup.object({
  observation_subcount_id: yup.number().nullable(),
  subcount: yup.number().nullable().required('A subcount is required'),
  comment: yup.string().nullable(),

  measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().nullable().required('A measurement ID is required'),
      // Null values are allowed, which implies the value is unknown
      measurement_option_id: yup.string().nullable(),
      measurement_value: yup.number().nullable()
    })
  ),

  environments: yup.array().of(
    yup
      .object({
        environment_qualitative_id: yup.string().nullable(),
        environment_option_id: yup.string().nullable(),
        environment_quantitative_id: yup.string().nullable(),
        value: yup.number().nullable()
      })
      .when('environment_option_id', {
        is: (environment_option_id: string) => environment_option_id,
        then: yup.object({
          environment_qualitative_id: yup.string().nullable().required('A value is required'),
          environment_option_id: yup.string().nullable().required('A value is required')
        }),
        otherwise: yup.object({
          environment_quantitative_id: yup.string().nullable().required('A value is required'),
          value: yup.number().nullable().required('A value is required')
        })
      })
  )
});

// Define the full validation schema for the observation
export const ObservationYupSchema = yup.object({
  standardColumns: yup
    .object({
      observation_subcount_id: yup.number().nullable(),
      itis_tsn: yup.number().nullable().required('Species is required.'),
      itis_scientific_name: yup.string().nullable(),
      survey_sample_site_id: yup.number().nullable(),
      method_technique_id: yup.number().nullable(),
      survey_sample_period_id: yup.number().nullable(),
      count: yup.number().nullable().optional(),
      observation_date: yup.date().nullable(),
      observation_time: yup.string().nullable(),
      latitude: yup
        .number()
        .nullable()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
      longitude: yup
        .number()
        .nullable()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
    })
    .when(['survey_sample_site_id', 'latitude', 'longitude'], {
      is: (survey_sample_site_id: number, latitude: number, longitude: number) =>
        !survey_sample_site_id && (!latitude || !longitude),
      then: yup.object({
        latitude: yup.number().nullable().required('Latitude and longitude or a sampling site must be provided'),
        longitude: yup.number().nullable().required('Latitude and longitude or a sampling site must be provided')
      })
    })
    .when(['survey_sample_period_id', 'observation_date'], {
      is: (survey_sample_period_id: number, observation_date: string) => !survey_sample_period_id && !observation_date,
      then: yup.object({
        observation_date: yup.date().nullable().required('Observation date or a sampling period must be provided')
      })
    }),
  subcounts: yup.array().of(subcountValidationSchema).required('At least one subcount is required.')
});

interface IObservationFormProps<TInitialFormikData extends IObservationForm> {
  initialData: TInitialFormikData;
  handleSubmit: (formikData: TInitialFormikData) => void;
  formikRef: React.RefObject<FormikProps<TInitialFormikData>>;
}

const ObservationForm = <TInitialFormikData extends IObservationForm>(
  props: IObservationFormProps<TInitialFormikData>
) => {
  const [showSamplingInformation, setShowSamplingInformation] = useState(false);

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialData}
      validationSchema={ObservationYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />

        {/* Species Form */}
        <HorizontalSplitFormComponent title="Species" summary="Enter the species observed">
          <ObservationSpeciesForm formikFieldName="standardColumns" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Sampling Information Form */}
        <HorizontalSplitFormComponent
          title="Sampling Details"
          summary="Add details about the sampling site, technique, and period">
          <ObservationSamplingForm
            showSamplingInformation={showSamplingInformation}
            setShowSamplingInformation={setShowSamplingInformation}
          />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Location */}
        <HorizontalSplitFormComponent title="Location" summary="Enter the location of the observation">
          <ObservationLocationForm formikFieldName="standardColumns" />
        </HorizontalSplitFormComponent>
        <Divider />

        {/* Datetime Form */}
        <HorizontalSplitFormComponent title="Date & Time" summary="Enter the date and time of the observation">
          <ObservationDateTimeForm formikFieldName="standardColumns" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/*Environments Form */}
        <HorizontalSplitFormComponent
          title="Environmental Conditions"
          summary="Enter information about the environment where the observation was made">
          <ObservationEnvironmentForm formikFieldName="standardColumns.environments" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Subcounts Form */}
        <HorizontalSplitFormComponent title="Subcounts" summary="Add subcounts to the observation">
          <SubcountForm />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Comments Form */}
        <HorizontalSplitFormComponent title="Comments" summary="Add comments about the observation">
          <ObservationCommentForm />
        </HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default ObservationForm;
