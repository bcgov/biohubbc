import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { ObservationFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface IObservationSpeciesFormProps {
  formikPrefixPath: string;
}

/**
 * Form component for the observation species.
 *
 * @param {IObservationSpeciesFormProps} props
 * @return {*}
 */
export const ObservationSpeciesForm = (props: IObservationSpeciesFormProps) => {
  const { formikPrefixPath } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const { setFieldValue, values, errors } = useFormikContext<ObservationFormData>();

  return (
    <Stack spacing={1}>
      <SpeciesAutocompleteField
        formikFieldName={`${formikPrefixPath}.itis_tsn`}
        label="Species"
        required={true}
        handleSpecies={(species) => {
          if (species.tsn) {
            setFieldValue(`${formikPrefixPath}.itis_tsn`, species.tsn);
            setFieldValue(`${formikPrefixPath}.itis_scientific_name`, species.scientificName);
          }
        }}
        clearOnSelect={true}
        error={get(errors, `${formikPrefixPath}.itis_tsn`)}
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
                setFieldValue(`${formikPrefixPath}.itis_tsn`, null);
              }}
            />
          </Collapse>
        )}
      </TransitionGroup>
      <AutocompleteField
        label="Sign"
        id={`${formikPrefixPath}.observation_sign_id`}
        name={`${formikPrefixPath}.observation_sign_id`}
        options={
          codesContext.codesDataLoader.data?.observation_subcount_signs.map((sign) => ({
            label: sign.name,
            value: sign.id
          })) ?? []
        }
        helpText="Select the type of evidence that was observed."
      />
    </Stack>
  );
};
