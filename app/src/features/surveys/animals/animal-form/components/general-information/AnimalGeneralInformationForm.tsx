import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SelectedSpecies from 'components/species/components/SelectedSpecies';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

export interface IAnimalGeneralInformationFormProps {
  isEdit?: boolean;
}

/**
 * Returns components for setting general information fields when creating or editing an animal
 *
 * @param {IAnimalGeneralInformationFormProps} props
 * @return {*}
 */
export const AnimalGeneralInformationForm = (props: IAnimalGeneralInformationFormProps) => {
  const { isEdit } = props;

  const { values, errors, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  const critterbaseApi = useCritterbaseApi();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  if (values.species) {
    measurementsDataLoader.load(values.species.tsn);
  }

  // Look for a measurement called "sex". If it exists, set the sex options.
  // Otherwise, the animal cannot have a sex value.
  const sexOptions: IAutocompleteFieldOption<string>[] =
    measurementsDataLoader.data?.qualitative
      .find((measurement) => measurement.measurement_name.toLowerCase() === 'sex')
      ?.options.map((option) => ({ value: option.qualitative_option_id, label: option.option_label })) ?? [];

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SpeciesAutocompleteField
            formikFieldName="species"
            label="Species"
            required={false}
            disabled={isEdit}
            defaultSpecies={values.species ?? undefined}
            handleSpecies={(species) => {
              setFieldValue('species', species);
              setFieldValue('ecological_units', []);
              if (species) {
                measurementsDataLoader.refresh(species.tsn);
                return;
              }
              measurementsDataLoader.clearData();
            }}
            clearOnSelect={true}
            error={errors.species}
          />
          {values.species && (
            <Collapse in={Boolean(values.species)} key={values.species.tsn}>
              <SelectedSpecies
                selectedSpecies={[values.species]}
                // Disable remove button if editing
                handleRemoveSpecies={isEdit ? undefined : () => setFieldValue('species', null)}
              />
            </Collapse>
          )}
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="nickname"
            label="Nickname"
            maxLength={200}
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="sex_qualitative_option_id"
            name="sex_qualitative_option_id"
            label="Sex"
            options={sexOptions}
            disabled={!sexOptions.length}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="critter_comment"
            label="Description"
            maxLength={1000}
            other={{ multiline: true, rows: 4 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
