import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import React, { useContext, useState } from 'react';
import { pluralize } from 'utils/Utils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, Critter, IAnimal } from './survey-animals/animal';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';

const SurveyAnimals: React.FC = () => {
  const cbApi = useCritterbaseApi();
  const dialogContext = useContext(DialogContext);

  const [openDialog, setOpenDialog] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);

  const toggleDialog = () => {
    setOpenDialog((d) => !d);
  };

  const AnimalFormValues: IAnimal = {
    general: { taxon_id: '', taxon_name: '', animal_id: '' },
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
    const postCritterPayload = async () => {
      await cbApi.critters.createCritter(critter);
      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {`Animal added to Survey`}
          </Typography>
        )
      });
      toggleDialog();
    };
    try {
      await postCritterPayload();
    } catch (err) {
      console.log(`Critter submission error ${JSON.stringify(err)}`);
    }
  };

  return (
    <Box>
      <EditDialog
        dialogTitle={
          <Box>
            <HelpButtonTooltip content={SurveyAnimalsI18N.animalIndividualsHelp}>
              <Typography variant="h3">Individuals</Typography>
            </HelpButtonTooltip>
            <Typography component="span" variant="subtitle1" color="textSecondary" mt={2}>
              {`${
                animalCount
                  ? `${pluralize(animalCount, `${animalCount} Animal`)} reported in this survey`
                  : `No individual animals were captured or reported in this survey`
              }`}
            </Typography>
          </Box>
        }
        open={openDialog}
        onSave={(values) => {
          handleOnSave(values);
        }}
        onCancel={toggleDialog}
        component={{
          element: <IndividualAnimalForm getAnimalCount={setAnimalCount} />,
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
