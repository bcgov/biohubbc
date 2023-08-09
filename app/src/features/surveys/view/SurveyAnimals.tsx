import { Box, Divider } from '@mui/material';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import React, { useState } from 'react';
import NoSurveySectionData from '../components/NoSurveySectionData';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';
import EditDialog from 'components/dialog/EditDialog';
import { AnimalSchema, Critter, IAnimal } from './survey-animals/animal';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';

const SurveyAnimals: React.FC = () => {
  const cbApi = useCritterbaseApi();
  const [openDialog, setOpenDialog] = useState(false);

  const toggleDialog = () => {
    setOpenDialog((d) => !d);
  };

  const AnimalFormValues: IAnimal = {
    general: { taxon_id: '', taxon_label: '' },
    captures: [],
    markings: [],
    mortality: [],
    measurements: [],
    family: [],
    images: [],
    device: undefined
  };

  const handleOnSave = async (animal: IAnimal) => {
    const critter = new Critter(animal);
    const res = await cbApi.critters.createCritter(critter);
    console.log(res);

    toggleDialog();
  };

  return (
    <Box>
      <EditDialog
        dialogTitle={'Individual Animals'}
        open={openDialog}
        onSave={(values) => handleOnSave(values)}
        onCancel={toggleDialog}
        component={{
          element: <IndividualAnimalForm />,
          initialValues: AnimalFormValues,
          validationSchema: AnimalSchema
        }}
      />
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
