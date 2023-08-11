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
  const { values, setFieldValue } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'general';

  useEffect(() => {
    console.log(values);
  }, [JSON.stringify(values)]);

  const handleTaxonName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(name, 'taxon_name'), label);
  };

  return (
    <FormSectionWrapper
      title={SurveyAnimalsI18N.animalGeneralTitle}
      titleHelp={SurveyAnimalsI18N.animalGeneralHelp}
      innerPaperProps={{ elevation: 0, variant: 'elevation', sx: { p: 0, mb: 0 } }}>
      <Grid item xs={6}>
        <Box mb={2}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalGeneral>(name, 'taxon_id')}
              controlProps={{ required: true, size: 'small' }}
              label={'Taxon'}
              id={'taxon'}
              route={'taxons'}
              handleChangeSideEffect={handleTaxonName}
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
