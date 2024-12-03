import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { ICreateObservationRequest } from 'interfaces/useObservationApi.interface';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface IObservationSpeciesFormProps {
  formikFieldName: string;
}

const ObservationSpeciesForm = (props: IObservationSpeciesFormProps) => {
  const { formikFieldName } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const { setFieldValue, values, errors } = useFormikContext<ICreateObservationRequest>();

  return (
    <Stack spacing={1}>
      <SpeciesAutocompleteField
        formikFieldName={`${formikFieldName}.itis_tsn`}
        label="Species"
        required={true}
        handleSpecies={(species) => {
          if (species.tsn) {
            setFieldValue(`${formikFieldName}.itis_tsn`, species.tsn);
            setFieldValue(`${formikFieldName}.itis_scientific_name`, species.scientificName);
          }
        }}
        clearOnSelect={true}
        error={get(errors, `${formikFieldName}.itis_tsn`)}
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
                setFieldValue(`${formikFieldName}.itis_tsn`, null);
              }}
            />
          </Collapse>
        )}
      </TransitionGroup>
      <AutocompleteField
        label="Sign"
        id={`${formikFieldName}.observation_sign_id`}
        name={`${formikFieldName}.observation_sign_id`}
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

export default ObservationSpeciesForm;
