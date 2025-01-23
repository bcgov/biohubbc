import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ObservationDateTimeForm } from 'features/surveys/observations/form/components/date/ObservationDateTimeForm';
import { ObservationEnvironmentForm } from 'features/surveys/observations/form/components/environments/ObservationEnvironmentForm';
import { ObservationLocationForm } from 'features/surveys/observations/form/components/location/ObservationLocationForm';
import { ObservationSamplingForm } from 'features/surveys/observations/form/components/sampling/ObservationSamplingForm';
import { ObservationSpeciesForm } from 'features/surveys/observations/form/components/species/ObservationSpeciesForm';
import {
  SubcountsForm,
  subcountsValidationSchema
} from 'features/surveys/observations/form/components/subcounts/SubcountsForm';
import { ObservationFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { Formik, FormikProps } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';

// Define the full validation schema for the observation
export const ObservationYupSchema = yup
  .object({
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
          .max(180, 'Longitude must be between -180 and 180'),
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
        is: (survey_sample_period_id: number, observation_date: string) =>
          !survey_sample_period_id && !observation_date,
        then: yup.object({
          observation_date: yup.date().nullable().required('Observation date or a sampling period must be provided')
        })
      })
  })
  .concat(subcountsValidationSchema);

interface IObservationFormProps<FormikData extends ObservationFormData> {
  initialFormData: FormikData;
  onSubmit: (formikData: FormikData) => void;
  formikRef: React.RefObject<FormikProps<FormikData>>;
}

const ObservationForm = <FormikData extends ObservationFormData>(props: IObservationFormProps<FormikData>) => {
  const { initialFormData, onSubmit, formikRef } = props;

  const [showSamplingInformation, setShowSamplingInformation] = useState(false);

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialFormData}
      validationSchema={ObservationYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={onSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />

        {/* Species Form */}
        <HorizontalSplitFormComponent title="Species" summary="Enter the species observed">
          <ObservationSpeciesForm formikPrefixPath="standardColumns" />
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
          <ObservationLocationForm formikPrefixPath="standardColumns" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Datetime Form */}
        <HorizontalSplitFormComponent title="Date & Time" summary="Enter the date and time of the observation">
          <ObservationDateTimeForm formikPrefixPath="standardColumns" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/*Environments Form */}
        <HorizontalSplitFormComponent
          title="Environmental Conditions"
          summary="Enter information about the environment where the observation was made">
          <ObservationEnvironmentForm formikPrefixPath="standardColumns.environments" />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Subcounts Form */}
        <HorizontalSplitFormComponent title="Subcounts" summary="Add subcounts to the observation">
          <SubcountsForm formikPrefixPath="" />
        </HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default ObservationForm;
