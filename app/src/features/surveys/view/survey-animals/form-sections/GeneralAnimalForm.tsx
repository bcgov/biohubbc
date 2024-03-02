import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { AnimalGeneralSchema, getAnimalFieldName, IAnimal, IAnimalGeneral, isRequiredInSchema } from '../animal';
import { ANIMAL_SECTIONS_FORM_MAP } from '../animal-sections';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = () => {
  const { setFieldValue } = useFormikContext<IAnimal>();
  const { animalKeyName } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalGeneralTitle];
  const handleTaxonName = (tsn: string, scientificName: string) => {
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_tsn'), tsn);
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_scientific_name'), scientificName);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
          <SpeciesAutocompleteField
            formikFieldName={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_tsn')}
            label="Species"
            required
            handleAddSpecies={(species) => {
              handleTaxonName(String(species.tsn), species.scientificName);
            }}
          />
        </HelpButtonTooltip>
      </Grid>
      <Grid item xs={12}>
        <CbSelectField
          name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'sex')}
          controlProps={{ required: isRequiredInSchema(AnimalGeneralSchema, 'sex') }}
          label="Sex"
          id={'sex'}
          route={'lookups/enum/sex'}
        />
      </Grid>
      <Grid item xs={12}>
        <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
          <CustomTextField
            other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'animal_id') }}
            label="Alias"
            name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'animal_id')}
          />
        </HelpButtonTooltip>
      </Grid>
      <Grid item xs={12}>
        <HelpButtonTooltip content={SurveyAnimalsI18N.wlhIdHelp}>
          <CustomTextField
            other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'wlh_id') }}
            label="Wildlife Health ID (Optional)"
            name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'wlh_id')}
          />
        </HelpButtonTooltip>
      </Grid>
    </Grid>
  );
};

export default GeneralAnimalForm;
