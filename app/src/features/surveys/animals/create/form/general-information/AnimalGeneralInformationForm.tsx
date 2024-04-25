import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import SelectedSpecies from 'components/species/components/SelectedSpecies';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';

const AnimalGeneralInformationForm = () => {
  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  return (
    <>
      <Box component="fieldset">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SpeciesAutocompleteField
              formikFieldName={'species'}
              label={'Species'}
              required={false}
              handleSpecies={(species) => {
                setFieldValue('species', species);
              }}
              clearOnSelect={true}
            />
            {values.species && (
              <Collapse in={Boolean(values.species.tsn)}>
                <SelectedSpecies
                  selectedSpecies={[values.species]}
                  handleRemoveSpecies={() => {
                    setFieldValue('species', null);
                  }}
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
              name="description"
              label="Description"
              maxLength={1000}
              other={{ multiline: true, rows: 4 }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AnimalGeneralInformationForm;
