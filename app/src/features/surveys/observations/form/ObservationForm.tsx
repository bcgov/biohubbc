import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ObservationDateTimeForm } from 'features/surveys/observations/form/components/date/ObservationDateTimeForm';
import { ObservationEnvironmentsForm } from 'features/surveys/observations/form/components/environments/ObservationEnvironmentsForm';
import { ObservationLocationForm } from 'features/surveys/observations/form/components/location/ObservationLocationForm';
import { ObservationSamplingForm } from 'features/surveys/observations/form/components/sampling/ObservationSamplingForm';
import { ObservationSpeciesForm } from 'features/surveys/observations/form/components/species/ObservationSpeciesForm';
import { SubcountsForm } from 'features/surveys/observations/form/components/subcounts/SubcountsForm';
import { ObservationFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { Formik, FormikProps } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';

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
        .max(180, 'Longitude must be between -180 and 180'),
      environments: yup.array().of(
        yup
          .object({
            environment_qualitative_id: yup.string().nullable(),
            environment_qualitative_option_id: yup.string().nullable(),
            environment_quantitative_id: yup.string().nullable(),
            value: yup.number().nullable(),
            _type: yup.string().oneOf(['qualitative', 'quantitative'])
          })
          .test('conditional-validation', 'Invalid fields based on _type', function (_value) {
            if (_value._type === 'qualitative') {
              if (!_value.environment_qualitative_id) {
                return this.createError({
                  path: `${this.path}.environment_qualitative_id`,
                  message: 'A value is required'
                });
              }
              if (!_value.environment_qualitative_option_id) {
                return this.createError({
                  path: `${this.path}.environment_qualitative_option_id`,
                  message: 'A value is required'
                });
              }
            } else if (_value._type === 'quantitative') {
              if (!_value.environment_quantitative_id) {
                return this.createError({
                  path: `${this.path}.environment_quantitative_id`,
                  message: 'A value is required'
                });
              }
              if (_value.value === null || _value.value === undefined) {
                return this.createError({
                  path: `${this.path}.value`,
                  message: 'A value is required'
                });
              }
            }
            return true;
          })
      )
    })
    .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
      if (!_value.survey_sample_period_id) {
        if (!_value.observation_date) {
          return this.createError({
            path: `${this.path}.observation_date`,
            message: 'Observation date or a sampling period must be provided'
          });
        }
      }
      return true;
    })
    .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
      if (!_value.survey_sample_period_id) {
        if (!_value.latitude) {
          return this.createError({
            path: `${this.path}.latitude`,
            message: 'Latitude or a sampling period must be provided'
          });
        }
      }
      return true;
    })
    .test('conditional-validation', 'Invalid fields based on survey_sample_period_id', function (_value) {
      if (!_value.survey_sample_period_id) {
        if (!_value.longitude) {
          return this.createError({
            path: `${this.path}.longitude`,
            message: 'Longitude or a sampling period must be provided'
          });
        }
      }
      return true;
    }),
  subcounts: yup
    .array()
    .of(
      yup.object({
        count: yup.number().nullable().required('A subcount is required'),
        comment: yup.string().nullable(),
        measurements: yup.array().of(
          yup.object({
            measurement_id: yup.string().nullable().required('A measurement ID is required'),
            measurement_option_id: yup.string().nullable(),
            measurement_value: yup.number().nullable()
          })
        )
      })
    )
    .min(1, 'At least one subcount is required.')
    .required('At least one subcount is required.')
});

interface IObservationFormProps {
  initialFormData: ObservationFormData;
  onSubmit: (formikData: ObservationFormData) => void;
  formikRef: React.RefObject<FormikProps<ObservationFormData>>;
}

const ObservationForm = (props: IObservationFormProps) => {
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
          <ObservationSpeciesForm />
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
          <ObservationLocationForm />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Datetime Form */}
        <HorizontalSplitFormComponent title="Date & Time" summary="Enter the date and time of the observation">
          <ObservationDateTimeForm />
        </HorizontalSplitFormComponent>

        <Divider />

        {/*Environments Form */}
        <HorizontalSplitFormComponent
          title="Environmental Conditions"
          summary="Enter information about the environment where the observation was made">
          <ObservationEnvironmentsForm />
        </HorizontalSplitFormComponent>

        <Divider />

        {/* Subcounts Form */}
        <HorizontalSplitFormComponent title="Subcounts" summary="Add subcounts to the observation">
          <SubcountsForm />
        </HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default ObservationForm;
