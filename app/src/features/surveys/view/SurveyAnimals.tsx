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
import { pluralize } from 'utils/Utils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import {
  AnimalSchema,
  AnimalTelemetryDeviceSchema,
  Critter,
  IAnimal,
  IAnimalTelemetryDevice
} from './survey-animals/animal';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';
import TelemetryDeviceForm from './survey-animals/TelemetryDeviceForm';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openAddCritterDialog, setOpenAddCritterDialog] = useState(false);
  const [openAddDeviceDialog, setOpenAddDeviceDialog] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);
  const [selectedCritterId, setSelectedCritterId] = useState<number | null>(null);
  // const [deploymentLookup, setDeploymentLookup] = useState<Record<string, unknown>>({});

  const { projectId, surveyId } = surveyContext;
  const {
    refresh: refreshCritters,
    load: loadCritters,
    data: critterData
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));

  const {
    refresh: refreshDeployments,
    load: loadDeployments,
    data: deploymentData
  } = useDataLoader(() => bhApi.survey.getDeploymentsInSurvey(projectId, surveyId));

  if (!critterData) {
    loadCritters();
  }

  if (!deploymentData) {
    loadDeployments();
  }

  const toggleDialog = () => {
    setOpenAddCritterDialog((d) => !d);
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

  const DeviceFormValues: IAnimalTelemetryDevice = {
    device_id: 0,
    device_make: '',
    frequency: 0,
    frequency_unit: '',
    device_model: '',
    attachment_start: '',
    attachment_end: undefined
  };

  const handleCritterSave = async (animal: IAnimal) => {
    const critter = new Critter(animal);
    const postCritterPayload = async () => {
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      refreshCritters();
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

  const handleTelemetrySave = async (survey_critter_id: number, data: IAnimalTelemetryDevice) => {
    const critter = critterData?.find((a) => a.survey_critter_id === survey_critter_id);
    const critterTelemetryDevice = { ...data, critter_id: critter?.critter_id ?? '' };
    try {
      await bhApi.survey.addDeployment(projectId, surveyId, survey_critter_id, critterTelemetryDevice);
    } catch (e) {
      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {`Could not add deployment.`}
          </Typography>
        )
      });
    }
    setOpenAddDeviceDialog(false);
    refreshDeployments();
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
                  ? `${animalCount} ${pluralize(animalCount, 'Animal')} reported in this survey`
                  : `No individual animals were captured or reported in this survey`
              }`}
            </Typography>
          </Box>
        }
        open={openAddCritterDialog}
        onSave={(values) => {
          handleCritterSave(values);
        }}
        onCancel={toggleDialog}
        component={{
          element: <IndividualAnimalForm getAnimalCount={setAnimalCount} />,
          initialValues: AnimalFormValues,
          validationSchema: AnimalSchema
        }}
      />
      <EditDialog
        dialogTitle={'Add Telemetry Device'}
        open={openAddDeviceDialog}
        component={{
          element: <TelemetryDeviceForm />,
          initialValues: DeviceFormValues,
          validationSchema: AnimalTelemetryDeviceSchema
        }}
        onCancel={() => setOpenAddDeviceDialog(false)}
        onSave={(values) => {
          if (selectedCritterId) {
            handleTelemetrySave(selectedCritterId, values);
          }
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
            deviceData={deploymentData}
            onRemoveCritter={(critter_id) => {
              bhApi.survey.removeCritterFromSurvey(projectId, surveyId, critter_id);
              refreshCritters();
            }}
            onAddDevice={(critter_id) => {
              setSelectedCritterId(critter_id);
              setOpenAddDeviceDialog(true);
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
