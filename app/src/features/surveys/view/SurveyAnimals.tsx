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
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash-es';
import React, { useContext, useState } from 'react';
import { datesSameNullable, pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { AnimalSchema, Critter, IAnimal } from './survey-animals/animal';
import { AnimalTelemetryDeviceSchema, Device, IAnimalTelemetryDevice } from './survey-animals/device';
import IndividualAnimalForm from './survey-animals/IndividualAnimalForm';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';
import TelemetryDeviceForm, { TELEMETRY_DEVICE_FORM_MODE } from './survey-animals/TelemetryDeviceForm';

const SurveyAnimals: React.FC = () => {
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  enum ANIMAL_FORM_MODE {
    ADD = 'add',
    EDIT = 'edit'
  }

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
    general: { wlh_id: '', taxon_id: '', taxon_name: '', animal_id: '', sex: 'Unknown' },
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

  const obtainAnimalFormInitialvalues = (mode: ANIMAL_FORM_MODE): IAnimal => {
    switch (mode) {
      case ANIMAL_FORM_MODE.ADD:
        return AnimalFormValues;
      case ANIMAL_FORM_MODE.EDIT: {
        const existingCritter = critterData?.find(
          (critter: IDetailedCritterWithInternalId) => currentCritterbaseCritterId === critter.critter_id
        );
        if (!existingCritter) {
          throw Error('This should not be reachable.');
        }
        return {
          general: {
            wlh_id: existingCritter.wlh_id ?? '',
            taxon_id: existingCritter.taxon_id,
            animal_id: existingCritter.animal_id ?? '',
            sex: existingCritter.sex,
            taxon_name: existingCritter.taxon
          },
          captures: existingCritter?.capture.map((a) => ({
            ...a,
            capture_comment: a.capture_comment ?? '',
            release_comment: a.release_comment ?? '',
            capture_timestamp: new Date(a.capture_timestamp),
            release_timestamp: a.release_timestamp ? new Date(a.release_timestamp) : undefined,
            capture_latitude: a.capture_location?.latitude,
            capture_longitude: a.capture_location?.longitude,
            capture_coordinate_uncertainty: a.capture_location?.coordinate_uncertainty ?? 0,
            release_longitude: a.release_location?.longitude,
            release_latitude: a.release_location?.latitude,
            release_coordinate_uncertainty: a.release_location?.coordinate_uncertainty ?? 0,
            capture_utm_northing: 0,
            capture_utm_easting: 0,
            release_utm_easting: 0,
            release_utm_northing: 0,
            projection_mode: 'wgs',
            _id: v4(),
            show_release: !!a.release_location
          })),
          markings: existingCritter.marking.map((a) => ({
            ...a,
            primary_colour_id: a.primary_colour_id ?? '',
            secondary_colour_id: a.secondary_colour_id ?? '',
            marking_comment: a.comment,
            _id: v4()
          })),
          mortality: existingCritter?.mortality.map((a) => ({
            ...a,
            _id: v4(),
            mortality_comment: a.mortality_comment ?? '',
            mortality_timestamp: new Date(a.mortality_timestamp),
            mortality_latitude: a.location.latitude,
            mortality_longitude: a.location.longitude,
            mortality_utm_easting: 0,
            mortality_utm_northing: 0,
            mortality_coordinate_uncertainty: a.location.coordinate_uncertainty ?? 0,
            mortality_pcod_confidence: a.proximate_cause_of_death_confidence,
            mortality_pcod_reason: a.proximate_cause_of_death_id ?? '',
            mortality_pcod_taxon_id: a.proximate_predated_by_taxon_id ?? '',
            mortality_ucod_confidence: a.ultimate_cause_of_death_confidence ?? '',
            mortality_ucod_reason: a.ultimate_cause_of_death_id ?? '',
            mortality_ucod_taxon_id: a.ultimate_predated_by_taxon_id ?? '',
            projection_mode: 'wgs'
          })),
          collectionUnits: existingCritter.collection_units.map((a) => ({
            ...a,
            _id: v4()
          })),
          measurements: [
            ...existingCritter.measurement.qualitative.map((a) => ({
              ...a,
              _id: v4(),
              value: undefined,
              measured_timestamp: a.measured_timestamp ? new Date(a.measured_timestamp) : ('' as unknown as Date),
              measurement_comment: a.measurement_comment ?? ''
            })),
            ...existingCritter.measurement.quantitative.map((a) => ({
              ...a,
              _id: v4(),
              qualitative_option_id: undefined,
              measured_timestamp: a.measured_timestamp ? new Date(a.measured_timestamp) : ('' as unknown as Date),
              measurement_comment: a.measurement_comment ?? ''
            }))
          ],
          family: [],
          images: [],
          device: undefined
        };
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

  const handleCritterSave = async (animal: IAnimal) => {
    const critter = new Critter(animal);
    const postCritterPayload = async () => {
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      refreshCritters();
      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {'Animal added to Survey'}
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
          initialValues: obtainAnimalFormInitialvalues(animalFormMode),
          validationSchema: AnimalSchema
        }}
      />
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
            onRemoveCritter={(critter_id) => {
              bhApi.survey.removeCritterFromSurvey(projectId, surveyId, critter_id);
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
