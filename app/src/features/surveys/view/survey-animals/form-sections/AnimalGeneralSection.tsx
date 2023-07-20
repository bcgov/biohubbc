import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
//import { useAnimalFormData } from '../useAnimalFormData';

const AnimalGeneralSection = () => {
  //const { data, updateData } = useAnimalFormData();
  return (
    <>
      <Grid item xs={6}>
        <Box mb={2}>
          <CustomTextField label="Individual's Label" name="animal.general_label" />
        </Box>
        <CustomTextField label="Taxon Select Placeholder" name="animal.taxon_placeholder" />
      </Grid>
    </>
  );
};

export default AnimalGeneralSection;
