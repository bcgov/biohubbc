import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import ComponentDialog from 'components/dialog/ComponentDialog';
import EditDialog from 'components/dialog/EditDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { AttachmentType } from 'constants/attachments';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash-es';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { datesSameNullable, pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, AnimalSex, Critter, IAnimal } from './survey-animals/animal';
import {
  createCritterUpdatePayload,
  transformCritterbaseAPIResponseToForm
} from './survey-animals/animal-form-helpers';
import {
  AnimalTelemetryDeviceSchema,
  Device,
  IAnimalTelemetryDevice,
  IDeploymentTimespan
} from './survey-animals/device';
import IndividualAnimalForm, { ANIMAL_FORM_MODE } from './survey-animals/IndividualAnimalForm';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';
import TelemetryDeviceForm, {
  IAnimalTelemetryDeviceFile,
  TELEMETRY_DEVICE_FORM_MODE
} from './survey-animals/TelemetryDeviceForm';
import TelemetryMap from './survey-animals/TelemetryMap';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openRemoveCritterDialog, setOpenRemoveCritterDialog] = useState(false);
  const [openAddCritterDialog, setOpenAddCritterDialog] = useState(false);
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [openViewTelemetryDialog, setOpenViewTelemetryDialog] = useState(false);
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

  const currentCritterbaseCritterId = useMemo(
    () => critterData?.find((a) => a.survey_critter_id === selectedCritterId)?.critter_id,
    [critterData, selectedCritterId]
  );

  if (!deploymentData) {
    loadDeployments();
  }

  const {
    refresh: refreshTelemetry,
    data: telemetryData,
    isLoading: telemetryLoading
  } = useDataLoader(() =>
    bhApi.survey.getCritterTelemetry(
      projectId,
      surveyId,
      selectedCritterId ?? 0,
      '1970-01-01',
      new Date().toISOString()
    )
  );

  useEffect(() => {
    if (currentCritterbaseCritterId) {
      refreshTelemetry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCritterbaseCritterId]);

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

  const uploadAttachment = async (file?: File, attachmentType?: AttachmentType) => {
    try {
      if (file && attachmentType === AttachmentType.KEYX) {
        await bhApi.survey.uploadSurveyKeyx(projectId, surveyId, file);
      } else if (file && attachmentType === AttachmentType.OTHER) {
        await bhApi.survey.uploadSurveyAttachments(projectId, surveyId, file);
      }
    } catch (error) {
      throw new Error(`Failed to upload attachment ${file?.name}`);
    }
  };

  const handleAddTelemetry = async (survey_critter_id: number, data: IAnimalTelemetryDeviceFile[]) => {
    const critter = critterData?.find((a) => a.survey_critter_id === survey_critter_id);
    const { attachmentFile, attachmentType, ...critterTelemetryDevice } = {
      ...data[0],
      critter_id: critter?.critter_id ?? ''
    };
    try {
      // Upload attachment if there is one
      await uploadAttachment(attachmentFile, attachmentType);
      // create new deployment record
      await bhApi.survey.addDeployment(projectId, surveyId, survey_critter_id, critterTelemetryDevice);
      setPopup('Successfully added deployment.');
      surveyContext.artifactDataLoader.refresh(projectId, surveyId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPopup('Failed to add deployment' + (error?.message ? `: ${error.message}` : '.'));
      } else {
        setPopup('Failed to add deployment.');
      }
    }
  };

  const updateDevice = async (formValues: IAnimalTelemetryDevice) => {
    const existingDevice = deploymentData?.find((deployment) => deployment.device_id === formValues.device_id);
    const formDevice = new Device({ collar_id: existingDevice?.collar_id, ...formValues });
    if (existingDevice && !_deepEquals(new Device(existingDevice), formDevice)) {
      try {
        await telemetryApi.devices.upsertCollar(formDevice);
      } catch (error) {
        throw new Error(`Failed to update collar ${formDevice.collar_id}`);
      }
    }
  };

  const updateDeployments = async (formDeployments: IDeploymentTimespan[], survey_critter_id: number) => {
    for (const formDeployment of formDeployments ?? []) {
      const existingDeployment = deploymentData?.find(
        (animalDeployment) => animalDeployment.deployment_id === formDeployment.deployment_id
      );
      if (
        !datesSameNullable(formDeployment?.attachment_start, existingDeployment?.attachment_start) ||
        !datesSameNullable(formDeployment?.attachment_end, existingDeployment?.attachment_end)
      ) {
        try {
          await bhApi.survey.updateDeployment(projectId, surveyId, survey_critter_id, formDeployment);
        } catch (error) {
          throw new Error(`Failed to update deployment ${formDeployment.deployment_id}`);
        }
      }
    }
  };

  const handleEditTelemetry = async (survey_critter_id: number, data: IAnimalTelemetryDeviceFile[]) => {
    const errors: string[] = [];
    for (const { attachmentFile, attachmentType, ...formValues } of data) {
      try {
        await uploadAttachment(attachmentFile, attachmentType);
        await updateDevice(formValues);
        await updateDeployments(formValues.deployments ?? [], survey_critter_id);
      } catch (error) {
        errors.push(`Device ${formValues.device_id} - ` + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    errors.length
      ? setPopup('Failed to save some data: ' + errors.join(', '))
      : setPopup('Updated deployment and device data successfully.');
  };

  const handleTelemetrySave = async (survey_critter_id: number, data: IAnimalTelemetryDeviceFile[]) => {
    if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD) {
      await handleAddTelemetry(survey_critter_id, data);
    } else if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.EDIT) {
      await handleEditTelemetry(survey_critter_id, data);
    }

    setOpenDeviceDialog(false);
    refreshDeployments();
  };

  const handleRemoveCritter = async () => {
    try {
      if (!selectedCritterId) {
        throw Error('Critter ID not set correctly.');
      }
      await bhApi.survey.removeCritterFromSurvey(projectId, surveyId, selectedCritterId);
    } catch (e) {
      setPopup('Failed to remove critter from survey.');
    }
    setOpenRemoveCritterDialog(false);
    refreshCritters();
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
      <YesNoDialog
        dialogTitle={'Remove critter from survey?'}
        dialogText={`Are you sure you would like to remove this critter from the survey? 
          The critter will remain present in Critterbase, but will no longer appear in the survey list.`}
        open={openRemoveCritterDialog}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel="Delete"
        noButtonLabel="Cancel"
        onClose={() => setOpenRemoveCritterDialog(false)}
        onNo={() => setOpenRemoveCritterDialog(false)}
        onYes={handleRemoveCritter}
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
            onRemoveCritter={() => {
              setOpenRemoveCritterDialog(true);
            }}
            onAddDevice={() => {
              setTelemetryFormMode(TELEMETRY_DEVICE_FORM_MODE.ADD);
              setOpenDeviceDialog(true);
            }}
            onEditDevice={() => {
              setTelemetryFormMode(TELEMETRY_DEVICE_FORM_MODE.EDIT);
              setOpenDeviceDialog(true);
            }}
            onEditCritter={() => {
              setAnimalFormMode(ANIMAL_FORM_MODE.EDIT);
              setOpenAddCritterDialog(true);
            }}
            onMapOpen={() => {
              setOpenViewTelemetryDialog(true);
            }}
          />
        ) : (
          <NoSurveySectionData text={'No Individual Animals'} paperVariant={'outlined'} />
        )}
      </Box>
      <ComponentDialog
        dialogProps={{ fullScreen: !!telemetryData?.points?.features?.length, maxWidth: false }}
        dialogTitle={'View Telemetry'}
        open={openViewTelemetryDialog}
        onClose={() => setOpenViewTelemetryDialog(false)}>
        {telemetryData?.points.features.length ? (
          <TelemetryMap
            telemetryData={telemetryData}
            deploymentData={deploymentData?.filter((a) => a.critter_id === currentCritterbaseCritterId)}
          />
        ) : (
          <Typography>
            {telemetryLoading
              ? 'Loading telemetry...'
              : "No telemetry has been collected for this animal's deployments."}
          </Typography>
        )}
      </ComponentDialog>
    </Box>
  );
};
export default SurveyAnimals;
