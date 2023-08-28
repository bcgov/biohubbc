import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import React from 'react';
import { AnimalGeneralSchema, getAnimalFieldName, IAnimal, IAnimalGeneral, isRequiredInSchema } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = () => {
  const { setFieldValue, handleBlur } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'general';

  const handleTaxonName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(name, 'taxon_name'), label);
  };

  return (
    <FormSectionWrapper
      title={SurveyAnimalsI18N.animalGeneralTitle}
      titleHelp={SurveyAnimalsI18N.animalGeneralHelp}
      innerPaperProps={{ elevation: 0, variant: 'elevation', sx: { p: 0, mb: 0 } }}>
      <Grid item xs={6} key={'animal-general-section'}>
        <Box mb={2}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalGeneral>(name, 'taxon_id')}
              controlProps={{ required: isRequiredInSchema(AnimalGeneralSchema, 'taxon_id'), size: 'small' }}
              label={'Taxon'}
              id={'taxon'}
              route={'taxons'}
              handleChangeSideEffect={handleTaxonName}
            />
          </HelpButtonTooltip>
        </Box>
        <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
          <CustomTextField
            other={{ size: 'small', required: isRequiredInSchema(AnimalGeneralSchema, 'animal_id') }}
            label="Individual's Label"
            name={getAnimalFieldName<IAnimalGeneral>(name, 'animal_id')}
            handleBlur={handleBlur}
          />
        </HelpButtonTooltip>
      </Grid>
    </FormSectionWrapper>
  );
};

export default GeneralAnimalForm;
