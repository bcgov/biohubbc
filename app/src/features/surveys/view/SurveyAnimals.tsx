import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Divider, Toolbar, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import ComponentDialog from 'components/dialog/ComponentDialog';
import EditDialog from 'components/dialog/EditDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
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
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { dateRangesOverlap, datesSameNullable } from 'utils/Utils';
import yup from 'utils/YupSchema';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, AnimalSex, Critter, IAnimal } from './survey-animals/animal';
import {
  createCritterUpdatePayload,
  transformCritterbaseAPIResponseToForm
} from './survey-animals/animal-form-helpers';
import {
  AnimalDeploymentTimespanSchema,
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
  const history = useHistory();

  const [openRemoveCritterDialog, setOpenRemoveCritterDialog] = useState(false);
  const [openAddCritterDialog, setOpenAddCritterDialog] = useState(false);
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [openViewTelemetryDialog, setOpenViewTelemetryDialog] = useState(false);
  const [isSubmittingTelemetry, setIsSubmittingTelemetry] = useState(false);
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
    device: []
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

  const deploymentOverlapTest = async (
    device_id: number,
    deployment_id: string,
    attachment_start: string | undefined,
    attachment_end: string | null | undefined
  ): Promise<string> => {
    const deviceDetails = await telemetryApi.devices.getDeviceDetails(device_id);
    if (!attachment_start) {
      return 'Attachment start is required.'; //It probably won't actually display this but just in case.
    }
    const existingDeployment = deviceDetails?.deployments?.find(
      (a) =>
        a.deployment_id !== deployment_id &&
        dateRangesOverlap(a.attachment_start, a.attachment_end, attachment_start, attachment_end)
    );
    if (existingDeployment) {
      return `This will conflict with an existing deployment for the device running from ${
        existingDeployment.attachment_start
      } until ${existingDeployment.attachment_end ?? 'indefinite.'}`;
    } else {
      return '';
    }
  };

  const AnimalDeploymentSchemaAsyncValidation = AnimalTelemetryDeviceSchema.shape({
    device_make: yup
      .string()
      .required('Required')
      .test('checkDeviceMakeIsNotChanged', '', async (value, context) => {
        // Bypass to avoid an api call when invalid device_id
        if (!context.parent.device_id) {
          return true;
        }
        const deviceDetails = await telemetryApi.devices.getDeviceDetails(Number(context.parent.device_id));
        if (deviceDetails.device?.device_make && deviceDetails.device?.device_make !== value) {
          return context.createError({
            message: `The current make for this device is ${deviceDetails.device?.device_make}, this value should not be changed.`
          });
        }
        return true;
      }),
    deployments: yup.array(
      AnimalDeploymentTimespanSchema.shape({
        attachment_start: yup
          .string()
          .required('Required.')
          .isValidDateString()
          .typeError('Required.')
          .test('checkDeploymentRange', '', async (value, context) => {
            const upperLevelIndex = Number(context.path.match(/\[(\d+)\]/)?.[1]); //Searches [0].deployments[0].attachment_start for the number contained in first index.
            const deviceId = context.options.context?.[upperLevelIndex]?.device_id;
            const errStr = deviceId
              ? await deploymentOverlapTest(
                  deviceId,
                  context.parent.deployment_id,
                  value,
                  context.parent.attachment_end
                )
              : '';
            if (errStr.length) {
              return context.createError({ message: errStr });
            } else {
              return true;
            }
          }),
        attachment_end: yup
          .string()
          .isValidDateString()
          .isEndDateSameOrAfterStartDate('attachment_start')
          .nullable()
          .test('checkDeploymentRangeEnd', '', async (value, context) => {
            const upperLevelIndex = Number(context.path.match(/\[(\d+)\]/)?.[1]); //Searches [0].deployments[0].attachment_start for the number contained in first index.
            const deviceId = context.options.context?.[upperLevelIndex]?.device_id;
            const errStr = deviceId
              ? await deploymentOverlapTest(
                  deviceId,
                  context.parent.deployment_id,
                  context.parent.attachment_start,
                  value
                )
              : '';
            if (errStr.length) {
              return context.createError({ message: errStr });
            } else {
              return true;
            }
          })
      })
    )
  });

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
            const deployment = {
              deployment_id,
              attachment_start: attachment_start?.split('T')?.[0] ?? '',
              attachment_end: attachment_end?.split('T')?.[0]
            };
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
              <HelpButtonTooltip
                content={SurveyAnimalsI18N.animalIndividualsHelp}
                iconSx={{ position: 'relative', top: '-4px', right: '0px' }}>
                <Typography variant="h3" component="span">
                  {animalFormMode === ANIMAL_FORM_MODE.EDIT ? 'Edit Animal' : 'Add Animal'}
                </Typography>
              </HelpButtonTooltip>
              {animalFormMode === ANIMAL_FORM_MODE.EDIT && (
                <Typography variant="body2" color={'textSecondary'}>
                  ID: {currentCritterbaseCritterId}
                </Typography>
              )}
            </Box>
          }
          open={openAddCritterDialog}
          onSave={(values) => {
            handleCritterSave(values);
          }}
          onCancel={toggleDialog}
          component={{
            element: <IndividualAnimalForm />,
            initialValues: initialValues,
            validationSchema: AnimalSchema
          }}
          dialogSaveButtonLabel="Save"
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
    setIsSubmittingTelemetry(true);
    if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD) {
      await handleAddTelemetry(survey_critter_id, data);
    } else if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.EDIT) {
      await handleEditTelemetry(survey_critter_id, data);
    }

    setIsSubmittingTelemetry(false);
    setOpenDeviceDialog(false);
    refreshDeployments();
    surveyContext.artifactDataLoader.refresh(projectId, surveyId);
  };

  const handleRemoveCritter = async () => {
    try {
      if (!selectedCritterId) {
        setPopup('Failed to remove critter from survey.');
        return;
      }
      await bhApi.survey.removeCritterFromSurvey(projectId, surveyId, selectedCritterId);
    } catch (e) {
      setPopup('Failed to remove critter from survey.');
    }
    setOpenRemoveCritterDialog(false);
    refreshCritters();
  };

  const handleRemoveDeployment = async (deployment_id: string) => {
    try {
      if (!selectedCritterId) {
        setPopup('Failed to delete deployment.');
        return;
      }
      await bhApi.survey.removeDeployment(projectId, surveyId, selectedCritterId, deployment_id);
    } catch (e) {
      setPopup('Failed to delete deployment.');
      return;
    }

    const deployments = deploymentData?.filter((a) => a.critter_id === currentCritterbaseCritterId) ?? [];
    if (deployments.length <= 1) {
      setOpenDeviceDialog(false);
    }
    refreshDeployments();
  };

  return (
    <Box>
      {renderAnimalFormSafe()}
      <EditDialog
        dialogTitle={
          telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'Add Telemetry Device' : 'Edit Telemetry Devices'
        }
        dialogSaveButtonLabel="Save"
        open={openDeviceDialog}
        dialogLoading={isSubmittingTelemetry}
        component={{
          element: <TelemetryDeviceForm removeAction={handleRemoveDeployment} survey_critter_id={-1} />, // This section will be removed
          initialValues: obtainDeviceFormInitialValues(telemetryFormMode),
          validationSchema: yup.array(AnimalDeploymentSchemaAsyncValidation),
          validateOnBlur: false,
          validateOnChange: true
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
      <Toolbar>
        <Typography
          component="h2"
          variant="h4"
          sx={{
            flex: '1 1 auto'
          }}>
          Marked and Known Animals
        </Typography>
        <Button
          component={RouterLink}
          to={`animals/`}
          title="Manage Marked and Known Animals"
          color="primary"
          variant="contained"
          startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
          Manage Animals
        </Button>
      </Toolbar>
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
              history.push(`animals/${selectedCritterId}`);
            }}
            onMapOpen={() => {
              setOpenViewTelemetryDialog(true);
            }}
          />
        ) : (
          <NoSurveySectionData text={'No Marked or Known Animals'} paperVariant={'outlined'} />
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
