import { Box, Grid, Typography } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
import { AttachmentType } from 'constants/attachments';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SurveySectionFullPageLayout } from 'features/surveys/components/SurveySectionFullPageLayout';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals, omitBy } from 'lodash';
import { useContext, useMemo, useState } from 'react';
import { datesSameNullable, setMessageSnackbar } from 'utils/Utils';
import { AddEditAnimal } from './AddEditAnimal';
import { AnimalSchema, AnimalSex, ANIMAL_FORM_MODE, Critter, IAnimal } from './animal';
import { createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import { IAnimalSections } from './animal-sections';
import AnimalList from './AnimalList';
import { Device, IAnimalTelemetryDevice, IDeploymentTimespan } from './device';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { IAnimalTelemetryDeviceFile, TELEMETRY_DEVICE_FORM_MODE } from './TelemetryDeviceForm';

export interface IAnimalStatus {
  message?: string;
  success?: boolean;
  isLoading: boolean;
}

export const SurveyAnimalsPage = () => {
  const [selectedSection, setSelectedSection] = useState<IAnimalSections>(SurveyAnimalsI18N.animalGeneralTitle);
  const { cid: survey_critter_id } = useQuery();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const dialogContext = useContext(DialogContext);
  const { surveyId, projectId, artifactDataLoader } = useContext(SurveyContext);

  const {
    data: critterData,
    load: loadCritters,
    refresh: refreshCritters,
    isLoading: crittersLoading
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));

  const {
    data: deploymentData,
    load: loadDeployments,
    refresh: refreshDeployments
  } = useDataLoader(() => bhApi.survey.getDeploymentsInSurvey(projectId, surveyId));

  loadCritters();
  loadDeployments();

  const defaultFormValues: IAnimal = useMemo(() => {
    return {
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
  }, []);

  const critterAsFormikValues = useMemo(() => {
    const existingCritter = critterData?.find(
      (critter: IDetailedCritterWithInternalId) => Number(survey_critter_id) === Number(critter.survey_critter_id)
    );
    if (!existingCritter) {
      return defaultFormValues;
    }
    const animal = transformCritterbaseAPIResponseToForm(existingCritter);
    const crittersDeployments = deploymentData?.filter((a) => a.critter_id === existingCritter.critter_id);
    let deployments: IAnimalTelemetryDevice[] = [];
    if (crittersDeployments) {
      //Any suggestions on something better than this reduce is welcome.
      //Idea is to transform flat rows of {device_id, ..., deployment_id, attachment_end, attachment_start}
      //to {device_id, ..., deployments: [{deployment_id, attachment_start, attachment_end}]}
      const red = crittersDeployments.reduce((acc: IAnimalTelemetryDevice[], curr) => {
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
      deployments = red;
    } else {
      deployments = [];
    }
    animal.device = deployments;
    return animal;
  }, [critterData, deploymentData, survey_critter_id, defaultFormValues]);

  const handleRemoveDeployment = async (deployment_id: string) => {
    try {
      if (survey_critter_id === undefined) {
        setMessageSnackbar('No critter set!', dialogContext);
      }
      await bhApi.survey.removeDeployment(projectId, surveyId, Number(survey_critter_id), deployment_id);
    } catch (e) {
      setMessageSnackbar('Failed to delete deployment.', dialogContext);
      return;
    }

    refreshDeployments();
  };

  const handleCritterSave = async (currentFormValues: IAnimal, formMode: ANIMAL_FORM_MODE): Promise<IAnimalStatus> => {
    const postCritterPayload = async () => {
      const critter = new Critter(currentFormValues);
      setOpenAddDialog(false);
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      return { success: true, message: 'Animal added to survey.', isLoading: false };
      //setMessageSnackbar('Animal added to survey.', dialogContext);
    };
    const patchCritterPayload = async () => {
      const initialFormValues = critterAsFormikValues;
      if (!initialFormValues) {
        throw Error('Could not obtain initial form values.');
      }
      const { create: createCritter, update: updateCritter } = createCritterUpdatePayload(
        initialFormValues,
        currentFormValues
      );
      const surveyCritter = critterData?.find(
        (critter) => Number(critter.survey_critter_id) === Number(survey_critter_id)
      );
      if (!survey_critter_id || !surveyCritter) {
        throw Error('The internal critter id for this row was not set correctly.');
      }
      await bhApi.survey.updateSurveyCritter(
        projectId,
        surveyId,
        surveyCritter.survey_critter_id,
        updateCritter,
        createCritter
      );
    };
    try {
      if (formMode === ANIMAL_FORM_MODE.ADD) {
        await postCritterPayload();
      } else {
        await patchCritterPayload();
      }
      refreshDeployments();
      refreshCritters();
      return {
        success: true,
        message: `Successfully ${formMode === ANIMAL_FORM_MODE.ADD ? 'created' : 'updated'} animal.`,
        isLoading: false
      };
    } catch (err) {
      //setMessageSnackbar(`Submmision failed ${(err as Error).message}`, dialogContext);
      return { success: true, message: `Submmision failed ${(err as Error).message}`, isLoading: false };
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
    if (!critter) console.log('Did not find critter in addTelemetry!');
    const { attachmentFile, attachmentType, ...critterTelemetryDevice } = {
      ...data[0],
      critter_id: critter?.critter_id ?? ''
    };
    try {
      // Upload attachment if there is one
      await uploadAttachment(attachmentFile, attachmentType);
      // create new deployment record
      const critterTelemNoBlanks = omitBy(
        critterTelemetryDevice,
        (value) => value === '' || value === null
      ) as IAnimalTelemetryDevice & { critter_id: string };
      await bhApi.survey.addDeployment(projectId, surveyId, survey_critter_id, critterTelemNoBlanks);
      setMessageSnackbar('Successfully added deployment.', dialogContext);
      artifactDataLoader.refresh(projectId, surveyId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessageSnackbar('Failed to add deployment' + (error?.message ? `: ${error.message}` : '.'), dialogContext);
      } else {
        setMessageSnackbar('Failed to add deployment.', dialogContext);
      }
    }
  };

  const updateDevice = async (formValues: IAnimalTelemetryDevice) => {
    const existingDevice = deploymentData?.find((deployment) => deployment.device_id === formValues.device_id);
    const formDevice = new Device({ collar_id: existingDevice?.collar_id, ...formValues });
    if (existingDevice && !_deepEquals(new Device(existingDevice), formDevice)) {
      try {
        console.log(`WOuld upsert collar in edit mode: ${JSON.stringify(formDevice, null, 2)}`);
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
          console.log(`Would update deployment in edit mode ${JSON.stringify(formDeployment, null, 2)}`);
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
      ? setMessageSnackbar('Failed to save some data: ' + errors.join(', '), dialogContext)
      : setMessageSnackbar('Updated deployment and device data successfully.', dialogContext);
  };

  const handleTelemetrySave = async (
    survey_critter_id: number,
    data: IAnimalTelemetryDeviceFile[],
    telemetryFormMode: TELEMETRY_DEVICE_FORM_MODE
  ) => {
    if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD) {
      await handleAddTelemetry(survey_critter_id, data);
    } else if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.EDIT) {
      await handleEditTelemetry(survey_critter_id, data);
    }
    refreshDeployments();
  };

  return (
    <>
      <Formik
        initialValues={critterAsFormikValues}
        enableReinitialize
        validationSchema={AnimalSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values, actions) => {
          const status = await handleCritterSave(values, ANIMAL_FORM_MODE.EDIT);
          actions.setStatus(status);
        }}>
        <SurveySectionFullPageLayout
          pageTitle="Manage Animals"
          sideBarComponent={
            <AnimalList
              onAddButton={() => setOpenAddDialog(true)}
              critterData={critterData}
              isLoading={crittersLoading}
              selectedSection={selectedSection}
              onSelectSection={(section) => setSelectedSection(section)}
            />
          }
          mainComponent={
            <AddEditAnimal
              critterData={critterData}
              deploymentData={deploymentData}
              section={selectedSection}
              telemetrySaveAction={(data, mode) => handleTelemetrySave(Number(survey_critter_id), data, mode)}
              deploymentRemoveAction={handleRemoveDeployment}
            />
          }
        />
      </Formik>
      <EditDialog
        dialogTitle={'Add New Animal'}
        open={openAddDialog}
        component={{
          element: (
            <Box>
              <Typography marginBottom={4}>
                Add basic animal info from this form. If you need to add captures, markings, or other details, you may
                do so after submitting these fields first.
              </Typography>
              <Grid container spacing={2}>
                <GeneralAnimalForm />
              </Grid>
            </Box>
          ),
          initialValues: defaultFormValues,
          validationSchema: AnimalSchema
        }}
        dialogSaveButtonLabel="Create Animal"
        onCancel={() => setOpenAddDialog(false)}
        onSave={(values) => handleCritterSave(values, ANIMAL_FORM_MODE.ADD)}
      />
    </>
  );
};
