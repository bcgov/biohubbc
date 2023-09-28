import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash-es';
import React, { useContext, useState } from 'react';
import { datesSameNullable, pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, AnimalSex, Critter, IAnimal } from './survey-animals/animal';
import {
  createCritterUpdatePayload,
  transformCritterbaseAPIResponseToForm
} from './survey-animals/animal-form-helpers';
import { AnimalTelemetryDeviceSchema, Device, IAnimalTelemetryDevice } from './survey-animals/device';
import IndividualAnimalForm, { ANIMAL_FORM_MODE } from './survey-animals/IndividualAnimalForm';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';
import TelemetryDeviceForm, { TELEMETRY_DEVICE_FORM_MODE } from './survey-animals/TelemetryDeviceForm';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openAddCritterDialog, setOpenAddCritterDialog] = useState(false);
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);
  const [selectedCritterId, setSelectedCritterId] = useState<number | null>(null);
  const [telemetryFormMode, setTelemetryFormMode] = useState<TELEMETRY_DEVICE_FORM_MODE>(
    TELEMETRY_DEVICE_FORM_MODE.ADD
  );
  const [animalFormMode, setAnimalFormMode] = useState<ANIMAL_FORM_MODE>(ANIMAL_FORM_MODE.ADD);

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
    setAnimalFormMode(ANIMAL_FORM_MODE.ADD);
    setOpenAddCritterDialog((d) => !d);
  };

  const setPopup = (message: string) => {
    dialogContext.setSnackbar({
      open: true,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      )
    });
  };

  const AnimalFormValues: IAnimal = {
    general: { wlh_id: '', taxon_id: '', taxon_name: '', animal_id: '', sex: AnimalSex.UNKNOWN, critter_id: '' },
    captures: [],
    markings: [],
    mortality: [],
    collectionUnits: [],
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

  const obtainAnimalFormInitialvalues = (mode: ANIMAL_FORM_MODE): IAnimal | null => {
    switch (mode) {
      case ANIMAL_FORM_MODE.ADD:
        return AnimalFormValues;
      case ANIMAL_FORM_MODE.EDIT: {
        const existingCritter = critterData?.find(
          (critter: IDetailedCritterWithInternalId) => currentCritterbaseCritterId === critter.critter_id
        );
        if (!existingCritter) {
          return null;
        }
        return transformCritterbaseAPIResponseToForm(existingCritter);
      }
    }
  };

  const obtainDeviceFormInitialValues = (mode: TELEMETRY_DEVICE_FORM_MODE) => {
    switch (mode) {
      case TELEMETRY_DEVICE_FORM_MODE.ADD:
        return [DeviceFormValues];
      case TELEMETRY_DEVICE_FORM_MODE.EDIT: {
        const deployments = deploymentData?.filter((a) => a.critter_id === currentCritterbaseCritterId);
        if (deployments) {
          //Any suggestions on something better than this reduce is welcome.
          //Idea is to transform flat rows of {device_id, ..., deployment_id, attachment_end, attachment_start}
          //to {device_id, ..., deployments: [{deployment_id, attachment_start, attachment_end}]}
          const red = deployments.reduce((acc: IAnimalTelemetryDevice[], curr) => {
            const currObj = acc.find((a: any) => a.device_id === curr.device_id);
            const { attachment_end, attachment_start, deployment_id, ...rest } = curr;
            const deployment = { deployment_id, attachment_start, attachment_end };
            if (!currObj) {
              acc.push({ ...rest, deployments: [deployment] });
            } else {
              currObj.deployments?.push(deployment);
            }
            return acc;
          }, []);
          return red;
        } else {
          return [DeviceFormValues];
        }
      }
    }
  };

  const renderAnimalFormSafe = (): JSX.Element => {
    const initialValues = obtainAnimalFormInitialvalues(animalFormMode);
    if (!initialValues) {
      return (
        <YesNoDialog
          dialogTitle={'Error'}
          dialogText={'Could not obtain existing critter values.'}
          open={openAddCritterDialog}
          onClose={toggleDialog}
          onNo={toggleDialog}
          onYes={toggleDialog}
          noButtonLabel="OK"
          yesButtonProps={{ sx: { display: 'none' } }}></YesNoDialog>
      );
    } else {
      return (
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
            element: (
              <IndividualAnimalForm
                critter_id={currentCritterbaseCritterId}
                mode={animalFormMode}
                getAnimalCount={setAnimalCount}
              />
            ),
            initialValues: initialValues,
            validationSchema: AnimalSchema
          }}
        />
      );
    }
  };

  const handleCritterSave = async (currentFormValues: IAnimal) => {
    const postCritterPayload = async () => {
      const critter = new Critter(currentFormValues);
      toggleDialog();
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      refreshCritters();
      setPopup('Animal added to survey.');
    };
    const patchCritterPayload = async () => {
      const initialFormValues = obtainAnimalFormInitialvalues(ANIMAL_FORM_MODE.EDIT);
      if (!initialFormValues) {
        throw Error('Could not obtain initial form values.');
      }
      const { create: createCritter, update: updateCritter } = createCritterUpdatePayload(
        initialFormValues,
        currentFormValues
      );
      toggleDialog();
      if (!selectedCritterId) {
        throw Error('The internal critter id for this row was not set correctly.');
      }
      await bhApi.survey.updateSurveyCritter(projectId, surveyId, selectedCritterId, updateCritter, createCritter);
      refreshCritters();
      setPopup('Animal data updated.');
    };
    try {
      if (animalFormMode === ANIMAL_FORM_MODE.ADD) {
        await postCritterPayload();
      } else {
        await patchCritterPayload();
      }
    } catch (err) {
      setPopup(`Submission failed. ${(err as Error).message}`);
      toggleDialog();
    }
  };

  const handleTelemetrySave = async (survey_critter_id: number, data: IAnimalTelemetryDevice[]) => {
    const critter = critterData?.find((a) => a.survey_critter_id === survey_critter_id);
    const critterTelemetryDevice = { ...data[0], critter_id: critter?.critter_id ?? '' };
    if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD) {
      try {
        await bhApi.survey.addDeployment(projectId, surveyId, survey_critter_id, critterTelemetryDevice);
        setPopup('Successfully added deployment.');
      } catch (e) {
        setPopup('Failed to add deployment.');
      }
    } else if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.EDIT) {
      for (const formValues of data) {
        const existingDevice = deploymentData?.find((a) => a.device_id === formValues.device_id);
        const formDevice = new Device({ collar_id: existingDevice?.collar_id, ...formValues });
        if (existingDevice && !_deepEquals(new Device(existingDevice), formDevice)) {
          //Verify whether the data entered in the form changed from the device metadata we already have.
          try {
            await telemetryApi.devices.upsertCollar(formDevice); //If it's different, upsert. Note that this alone does not touch a deployment.
          } catch (e) {
            setPopup(`Failed to update device ${formDevice.device_id}`);
          }
        }
        for (const formDeployment of formValues.deployments ?? []) {
          //Iterate over the deployments under this device.
          const existingDeployment = deploymentData?.find((a) => a.deployment_id === formDeployment.deployment_id); //Find the deployment info we already have.
          if (
            !datesSameNullable(formDeployment?.attachment_start, existingDeployment?.attachment_start) ||
            !datesSameNullable(formDeployment?.attachment_end, existingDeployment?.attachment_end) //Helper function necessary for this date comparison since moment(null) !== moment(null) normally.
          ) {
            try {
              await bhApi.survey.updateDeployment(projectId, surveyId, survey_critter_id, formDeployment);
            } catch (e) {
              setPopup(`Failed to update deployment ${formDeployment.deployment_id}`);
            }
          }
        }
      }
      setPopup('Updated deployment and device data successfully.');
    }

    setOpenDeviceDialog(false);
    refreshDeployments();
  };

  return (
    <Box>
      {renderAnimalFormSafe()}
      <EditDialog
        dialogTitle={
          telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'Add Telemetry Device' : 'Edit Telemetry Devices'
        }
        open={openDeviceDialog}
        component={{
          element: <TelemetryDeviceForm mode={telemetryFormMode} />,
          initialValues: obtainDeviceFormInitialValues(telemetryFormMode),
          validationSchema: yup.array(AnimalTelemetryDeviceSchema)
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
            onRemoveCritter={async (critter_id) => {
              try {
                await bhApi.survey.removeCritterFromSurvey(projectId, surveyId, critter_id);
              } catch (e) {
                setPopup('Failed to remove critter from survey.');
              }
              refreshCritters();
            }}
            onAddDevice={(critter_id) => {
              setTelemetryFormMode(TELEMETRY_DEVICE_FORM_MODE.ADD);
              setOpenDeviceDialog(true);
            }}
            onEditDevice={(device_id) => {
              setTelemetryFormMode(TELEMETRY_DEVICE_FORM_MODE.EDIT);
              setOpenDeviceDialog(true);
            }}
            onEditCritter={(critter_id) => {
              setAnimalFormMode(ANIMAL_FORM_MODE.EDIT);
              setOpenAddCritterDialog(true);
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
