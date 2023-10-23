import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import React from 'react';
import { AnimalGeneralSchema, getAnimalFieldName, IAnimal, IAnimalGeneral, isRequiredInSchema } from '../animal';
import { ANIMAL_SECTIONS_FORM_MAP } from '../animal-sections';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = () => {
  const { setFieldValue, handleBlur, values } = useFormikContext<IAnimal>();
  const { animalKeyName } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalGeneralTitle];
  const handleTaxonName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'taxon_name'), label);
  };

  return (
    <Box id="general-animal-form" component="fieldset">
      <Typography component="legend">{SurveyAnimalsI18N.animalGeneralTitle}</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mt: -1,
          mb: 3
        }}>
        {SurveyAnimalsI18N.animalGeneralHelp}
      </Typography>

      <Grid container spacing={3} key={'animal-general-section'}>
        <Grid item xs={12} md={6} lg={6}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'taxon_id')}
              controlProps={{
                required: isRequiredInSchema(AnimalGeneralSchema, 'taxon_id'),
                disabled: !!values.collectionUnits.length
              }}
              label={'Species'}
              id={'taxon'}
              route={'lookups/taxons'}
              handleChangeSideEffect={handleTaxonName}
            />
          </HelpButtonTooltip>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'sex')}
            controlProps={{ required: isRequiredInSchema(AnimalGeneralSchema, 'sex') }}
            label="Sex"
            id={'sex'}
            route={'lookups/sex'}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
            <CustomTextField
              other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'animal_id') }}
              label="Alias"
              name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'animal_id')}
              handleBlur={handleBlur}
            />
          </HelpButtonTooltip>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.wlhIdHelp}>
            <CustomTextField
              other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'wlh_id') }}
              label="Wildlife Health ID (Optional)"
              name={getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'wlh_id')}
              handleBlur={handleBlur}
            />
          </HelpButtonTooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralAnimalForm;
