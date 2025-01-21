import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { IObservationForm } from 'features/surveys/observations/form/ObservationForm.interface';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface IObservationSpeciesFormProps {
  formikSectionName: string;
}

const ObservationSpeciesForm = (props: IObservationSpeciesFormProps) => {
  const { formikSectionName } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const { setFieldValue, values, errors } = useFormikContext<IObservationForm>();

  return (
    <Stack spacing={1}>
      <SpeciesAutocompleteField
        formikFieldName={`${formikSectionName}.itis_tsn`}
        label="Species"
        required={true}
        handleSpecies={(species) => {
          if (species.tsn) {
            setFieldValue(`${formikSectionName}.itis_tsn`, species.tsn);
            setFieldValue(`${formikSectionName}.itis_scientific_name`, species.scientificName);
          }
        }}
        clearOnSelect={true}
        error={get(errors, `${formikSectionName}.itis_tsn`)}
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
                setFieldValue(`${formikSectionName}.itis_tsn`, null);
              }}
            />
          </Collapse>
        )}
      </TransitionGroup>
      <AutocompleteField
        label="Sign"
        id={`${formikSectionName}.observation_sign_id`}
        name={`${formikSectionName}.observation_sign_id`}
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
