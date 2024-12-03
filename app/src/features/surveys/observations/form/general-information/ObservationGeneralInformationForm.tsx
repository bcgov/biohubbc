import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateObservationRequest } from 'interfaces/useObservationApi.interface';
import React from 'react';

interface ObservationGeneralInformationFormProps {
  formikFieldName: string;
}

const ObservationGeneralInformationForm: React.FC<ObservationGeneralInformationFormProps> = ({ formikFieldName }) => {
  const formikProps = useFormikContext<ICreateObservationRequest>();

  return (
    <>
      <SpeciesAutocompleteField
        formikFieldName={`${formikFieldName}.itis_tsn`}
        label="Observed species"
        required={true}
        handleSpecies={(species) => {
          if (species.tsn) {
            formikProps.setFieldValue(`${formikFieldName}.itis_tsn`, species.tsn);
          }
        }}
        clearOnSelect={true}
      />
      <Stack direction="row" my={2}>
        <SingleDateField label="Date" name={`${formikFieldName}.date`} />
        <TimeField formikProps={formikProps} label="Time" name={`${formikFieldName}.time`} id="time" required={false} />
      </Stack>
      <Stack direction="row" mt={2}>
        <CustomTextField label="Latitude" name={`${formikFieldName}.latitude`} other={{ type: 'number' }} />
        <CustomTextField label="Longitude" name={`${formikFieldName}.longitude`} other={{ type: 'number' }} />
      </Stack>
    </>
  );
};

export default ObservationGeneralInformationForm;
