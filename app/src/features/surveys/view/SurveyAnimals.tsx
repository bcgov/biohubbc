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
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React, { useContext, useState } from 'react';
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
import TelemetryDeviceForm, { TelemetryDeviceFormMode } from './survey-animals/TelemetryDeviceForm';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openAddCritterDialog, setOpenAddCritterDialog] = useState(false);
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);
  const [selectedCritterId, setSelectedCritterId] = useState<number | null>(null);
  const [telemetryFormMode, setTelemetryFormMode] = useState<'add' | 'edit'>('add');

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

  const currentCritterbaseCritterId = critterData?.find((a) => a.survey_critter_id === selectedCritterId)?.critter_id;

  if (!deploymentData) {
    loadDeployments();
  }

  const toggleDialog = () => {
    setOpenAddCritterDialog((d) => !d);
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

  const DeviceFormValues: IAnimalTelemetryDevice = {
    device_id: '' as unknown as number,
    device_make: '',
    frequency: '' as unknown as number,
    frequency_unit: '',
    device_model: '',
    deployments: [
      {
        deployment_id: '',
        attachment_start: '',
        attachment_end: undefined
      }
    ]
  };

  const obtainDeviceFormInitialValues = (mode: TelemetryDeviceFormMode) => {
    switch (mode) {
      case 'add':
        return [DeviceFormValues];
      case 'edit': {
        const deployments = deploymentData?.filter((a) => a.critter_id === currentCritterbaseCritterId);
        if (deployments) {
          //Any suggestions on something better than this reduce is welcome.
          //Idea is to transform flat rows of {device_id, ... , attachment_end, attachment_start}
          //to {device_id, ..., deployments: [{deployments, attachment_start, attachment_end}]}
          const red = deployments.reduce((acc, curr) => {
            const currObj = acc.find((a) => a.device_id === curr.device_id);
            const { attachment_end, attachment_start, deployment_id, ...rest } = curr;
            const deployment = { deployment_id, attachment_start, attachment_end };
            if (!currObj) {
              acc.push({ ...rest, deployments: [deployment] });
            } else {
              currObj.deployments?.push(deployment);
            }
            return acc;
          }, [] as IAnimalTelemetryDevice[]);
          return red;
        } else {
          return [DeviceFormValues];
        }
      }
    }
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

  const handleTelemetrySave = async (survey_critter_id: number, data: any) => {
    const critter = critterData?.find((a) => a.survey_critter_id === survey_critter_id);
    const critterTelemetryDevice = { ...data, critter_id: critter?.critter_id ?? '' };
    if (telemetryFormMode === 'add') {
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
    } else if (telemetryFormMode === 'edit') {
      console.log('Not implemented.');
    }

    setOpenDeviceDialog(false);
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
                  ? `${pluralize('Animal', animalCount)} reported in this survey`
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
        dialogTitle={telemetryFormMode === 'add' ? 'Add Telemetry Device' : 'Edit Telemetry Devices'}
        open={openDeviceDialog}
        component={{
          element: <TelemetryDeviceForm />,
          initialValues: obtainDeviceFormInitialValues(telemetryFormMode),
          validationSchema: AnimalTelemetryDeviceSchema
        }}
        onCancel={() => setOpenDeviceDialog(false)}
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
            onMenuOpen={setSelectedCritterId}
            onRemoveCritter={(critter_id) => {
              bhApi.survey.removeCritterFromSurvey(projectId, surveyId, critter_id);
              refreshCritters();
            }}
            onAddDevice={(critter_id) => {
              setTelemetryFormMode('add');
              setOpenDeviceDialog(true);
            }}
            onEditDevice={(device_id) => {
              setTelemetryFormMode('edit');
              setOpenDeviceDialog(true);
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
