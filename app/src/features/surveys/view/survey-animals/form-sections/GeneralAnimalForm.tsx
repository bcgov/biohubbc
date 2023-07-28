import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalGeneral } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

/**
 * Renders the General section for the Individual Animal form
 *
 * Returns {*}
 */

const GeneralAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'general';
  useEffect(() => {
    console.log(values);
  }, [JSON.stringify(values)]);
  return (
    <FormSectionWrapper title={SurveyAnimalsI18N.animalGeneralTitle} titleHelp={SurveyAnimalsI18N.animalGeneralHelp}>
      <Grid item xs={6}>
        <Box mb={2}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalGeneral>(name, 'taxon_id')}
              label={'Taxon'}
              id={'taxon'}
              route={'taxons'}
            />
          </HelpButtonTooltip>
        </Box>
        <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
          <CustomTextField
            other={{ size: 'small' }}
            label="Individual's Label"
            name={getAnimalFieldName<IAnimalGeneral>(name, 'animal_id')}
          />
        </HelpButtonTooltip>
      </Grid>
    </FormSectionWrapper>
  );
};

export default GeneralAnimalForm;
