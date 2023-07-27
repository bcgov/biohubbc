import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CustomTextField from 'components/fields/CustomTextField';
import React, { useEffect } from 'react';
import { IAnimal } from '../animal';
import { useFormikContext } from 'formik';
import FormSectionWrapper from './FormSectionWrapper';
import { Box } from '@mui/system';

const GeneralAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  useEffect(() => {
    console.log(values.general);
  }, [values.general]);
  return (
    <FormSectionWrapper title="General" titleHelp="General Help">
      <Grid item xs={6}>
        <Box mb={2}>
          <HelpButtonTooltip content="help help help help help help">
            <CustomTextField other={{ size: 'small' }} label="Taxon Select Placeholher" name="general.taxon_id" />
          </HelpButtonTooltip>
        </Box>
        <HelpButtonTooltip content="help">
          <CustomTextField other={{ size: 'small' }} label="Individual's Label" name="general.taxon_label" />
        </HelpButtonTooltip>
      </Grid>
    </FormSectionWrapper>
  );
};

export default GeneralAnimalForm;
