import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
//import { useAnimalFormData } from '../useAnimalFormData';

const AnimalGeneralSection = () => {
  //const { data, updateData } = useAnimalFormData();
  return (
    <>
      <Grid item xs={6}>
        <Box mb={2}>
          <HelpButtonTooltip content="help help help help help help">
            <CustomTextField label="Taxon Select Placeholher" name="animal.taxon_placeholder" />
          </HelpButtonTooltip>
        </Box>
        <HelpButtonTooltip content="help">
          <CustomTextField label="Individual's Label" name="animal.general_label" />
        </HelpButtonTooltip>
      </Grid>
    </>
  );
};

export default AnimalGeneralSection;
