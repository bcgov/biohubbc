import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { ICreateObservationRequest } from 'interfaces/useObservationApi.interface';
import React, { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import ObservationGeneralInformationForm from './general-information/ObservationGeneralInformationForm';
import ObservationSamplingForm from './sampling/ObservationSamplingForm';
import SubcountForm from './subcounts/SubcountForm';

// Define the validation schema for each subcount
export const subcountValidationSchema = yup.object({
  observation_subcount_id: yup.number().nullable(),
  subcount: yup.number().required('A subcount is required.').nullable(),
  comment: yup.string().nullable(),

  qualitative_measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().required('Measurement ID is required.'),
      measurement_option_id: yup.string().required('Measurement Option ID is required.')
    })
  ),

  quantitative_measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().required('Measurement ID is required.'),
      measurement_value: yup.number().required('Measurement Value is required.')
    })
  ),

  qualitative_environments: yup.array().of(
    yup.object({
      environment_qualitative_id: yup.string().required('Qualitative Environment ID is required.'),
      environment_qualitative_option_id: yup.string().required('Qualitative Environment Option ID is required.')
    })
  ),

  quantitative_environments: yup.array().of(
    yup.object({
      environment_quantitative_id: yup.string().required('Quantitative Environment ID is required.'),
      value: yup.number().required('Quantitative Value is required.')
    })
  )
});

// Define the full validation schema for the observation
export const ObservationYupSchema = yup.object({
  standardColumns: yup.object({
    observation_subcount_id: yup.number().nullable(),
    itis_tsn: yup.number().required('A species or taxon is required.'),
    itis_scientific_name: yup.string().nullable(),
    survey_sample_site_id: yup.number().nullable(),
    survey_sample_method_id: yup.number().nullable(),
    survey_sample_period_id: yup.number().nullable(),
    count: yup.number().nullable().optional(),
    observation_date: yup.date().nullable(),
    observation_time: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable()
  }),
  subcounts: yup.array().of(subcountValidationSchema).required('At least one subcount is required.')
});

interface IObservationFormProps<T extends ICreateObservationRequest> {
  initialData: T;
  handleSubmit: (formikData: T) => void;
  formikRef: React.RefObject<FormikProps<T>>;
}

interface IObservationFormProps<T extends ICreateObservationRequest> {
  initialData: T;
  handleSubmit: (formikData: T) => void;
  formikRef: React.RefObject<FormikProps<T>>;
}

const ObservationForm = <T extends ICreateObservationRequest>(props: IObservationFormProps<T>) => {
  const [showSamplingInformation, setShowSamplingInformation] = useState(false);
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  if (!codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Formik
      initialValues={props.initialData}
      validationSchema={ObservationYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        {/* General Information Form */}
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter general information about the observation"
          component={<ObservationGeneralInformationForm formikFieldName="standardColumns" />}
        />

        <Divider />

        {/* Sampling Information Form */}
        <HorizontalSplitFormComponent
          title="Sampling Information"
          summary="Add details related to the sampling site, technique, and period"
          component={
            <ObservationSamplingForm
              showSamplingInformation={showSamplingInformation}
              setShowSamplingInformation={setShowSamplingInformation}
            />
          }
        />

        <Divider />

        {/* Subcounts Form */}
        <HorizontalSplitFormComponent
          title="Subcounts"
          summary="Add subcounts related to this observation"
          component={<SubcountForm />}
        />
      </Stack>
    </Formik>
  );
};

export default ObservationForm;
