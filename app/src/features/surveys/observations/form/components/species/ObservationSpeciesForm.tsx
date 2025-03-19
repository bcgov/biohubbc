import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/components/ObservationForm.interface';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

/**
 * Form component for the observation species.
 *
 * @return {*}
 */
export const ObservationSpeciesForm = () => {
  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const { setFieldValue, values, errors } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  return (
    <Stack spacing={1}>
      <SpeciesAutocompleteField
        formikFieldName="standardColumns.itis_tsn"
        label="Species"
        required={true}
        handleSpecies={(species) => {
          if (species.tsn) {
            setFieldValue('standardColumns.itis_tsn', species.tsn);
            setFieldValue('standardColumns.itis_scientific_name', species.scientificName);
          }
        }}
        clearOnSelect={true}
        error={get(errors, 'standardColumns.itis_tsn')}
      />
      <TransitionGroup>
        {values.standardColumns.itis_tsn && values.standardColumns.itis_scientific_name && (
          <Collapse>
            <SpeciesSelectedCard
              sx={{ bgcolor: grey[100], mb: 1 }}
              species={{
                commonNames: [],
                scientificName: values.standardColumns.itis_scientific_name ?? '',
                tsn: values.standardColumns.itis_tsn ?? ''
              }}
              handleRemove={() => {
                setFieldValue('standardColumns.itis_tsn', null);
              }}
            />
          </Collapse>
        )}
      </TransitionGroup>
      <AutocompleteField
        label="Sign"
        id={'standardColumns.observation_sign_id'}
        name={'standardColumns.observation_sign_id'}
        options={
          codesContext.codesDataLoader.data?.observation_signs.map((sign) => ({
            label: sign.name,
            value: sign.id
          })) ?? []
        }
        helpText="Select the type of evidence that was observed."
      />
    </Stack>
  );
};
