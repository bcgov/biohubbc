import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useState } from 'react';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, Critter, IAnimal } from './survey-animals/animal';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openDialog, setOpenDialog] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);

  const { projectId, surveyId } = surveyContext;
  const { refresh, load, data: critterData } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));
  if (!critterData) {
    load();
  }
  const toggleDialog = () => {
    setOpenDialog((d) => !d);
  };

  const pluralize = (str: string, count: number) =>
    count > 1 || count === 0 ? `${count} ${str}'s` : `${count} ${str}`;

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
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      refresh();
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
                  ? `${pluralize('Animal', animalCount)} reported in this survey`
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
        {critterData?.length ? (
          <SurveyAnimalsTable
            animalData={critterData}
            removeCritterAction={(critter_id) => {
              bhApi.survey.removeCritterFromSurvey(projectId, surveyId, critter_id);
              refresh();
            }}
          />
        ) : (
          <NoSurveySectionData text={'No Individual Animals'} paperVariant={'outlined'} />
        )}
      </Box>
    </Box>
  );
};
export default SurveyAnimals;
