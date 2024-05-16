import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import SelectedSpecies from 'components/species/components/SelectedSpecies';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

export interface IAnimalGeneralInformationFormProps {
  isEdit?: boolean;
}

/**
 * Returns components for setting general information fields when creating or editing an animal
 *
 * @returns
 */
export const AnimalGeneralInformationForm = (props: IAnimalGeneralInformationFormProps) => {
  const { isEdit } = props;

  const { values, errors, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SpeciesAutocompleteField
            formikFieldName={'species'}
            label={'Species'}
            required={false}
            disabled={isEdit}
            handleSpecies={(species) => {
              setFieldValue('species', species);
              setFieldValue('ecological_units', []);
            }}
            clearOnSelect={true}
            error={errors.species}
          />
          {values.species && (
            <Collapse in={Boolean(values.species)}>
              <SelectedSpecies
                selectedSpecies={[values.species]}
                handleRemoveSpecies={
                  isEdit
                    ? undefined
                    : () => {
                        setFieldValue('species', null);
                      }
                }
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
