/* eslint-disable prettier/prettier */
import { Box, Divider } from '@mui/material';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import React, { useState } from 'react';
import NoSurveySectionData from '../components/NoSurveySectionData';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';

const SurveyAnimals: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const toggleDialog = () => {
    setOpenDialog((d) => !d);
  };

  return (
    <Box>
      <ComponentDialog open={openDialog} dialogTitle="Individual Animals" onClose={toggleDialog}>
        <IndividualAnimalForm />
      </ComponentDialog>
      <H2ButtonToolbar
        label="Individual Animals"
        buttonLabel="Import"
        buttonTitle="Import Animals"
        buttonProps={{ variant: 'contained', color: 'primary' }}
        buttonStartIcon={<Icon path={mdiImport} size={1} />}
        buttonOnClick={toggleDialog}
      />
      <Divider></Divider>
      <Box p={3}>
        <NoSurveySectionData text={'No Individual Animals'} paperVariant={'outlined'} />
      </Box>
    </Box>
  );
};
export default SurveyAnimals;
