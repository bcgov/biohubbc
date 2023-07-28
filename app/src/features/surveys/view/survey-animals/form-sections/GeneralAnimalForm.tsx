import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CustomTextField from 'components/fields/CustomTextField';
import React, { useEffect } from 'react';
import FormSectionWrapper from './FormSectionWrapper';
import { Box } from '@mui/system';
import { useFormikContext } from 'formik';
import { IAnimal } from '../animal';
import { SurveyAnimalsI18N } from 'constants/i18n';
import CbSelectField from 'components/fields/CbSelectField';

/**
 * Renders the General section for the Individual Animal form
 *
 * Returns {*}
 */

const GeneralAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  useEffect(() => {
    console.log(values);
  }, [JSON.stringify(values)]);
  return (
    <FormSectionWrapper title={SurveyAnimalsI18N.animalGeneralTitle} titleHelp={SurveyAnimalsI18N.animalGeneralHelp}>
      <Grid item xs={6}>
        <Box mb={2}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
            <CbSelectField name={'taxon'} label={'Taxon'} id={'taxon'} route={'taxons'} />
          </HelpButtonTooltip>
        </Box>
        <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
          <CustomTextField other={{ size: 'small' }} label="Individual's Label" name="general.taxon_label" />
        </HelpButtonTooltip>
      </Grid>
    </FormSectionWrapper>
  );
};

export default GeneralAnimalForm;
