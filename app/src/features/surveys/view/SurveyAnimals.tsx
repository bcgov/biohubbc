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
    general: { wlh_id: '', taxon_id: '', taxon_name: '', animal_id: '', sex: 'Unknown', critter_id: '' },
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
            taxon_name: existingCritter.taxon,
            critter_id: existingCritter.critter_id
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
            show_release: !!a.release_location,
            capture_location_id: a.capture_location_id ?? undefined,
            release_location_id: a.release_location_id ?? undefined
          })),
          markings: existingCritter.marking.map((a) => ({
            ...a,
            primary_colour_id: a.primary_colour_id ?? '',
            secondary_colour_id: a.secondary_colour_id ?? '',
            marking_comment: a.comment ?? '',
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
            proximate_cause_of_death_confidence: a.proximate_cause_of_death_confidence,
            proximate_cause_of_death_id: a.proximate_cause_of_death_id ?? '',
            proximate_predated_by_taxon_id: a.proximate_predated_by_taxon_id ?? '',
            ultimate_cause_of_death_confidence: a.ultimate_cause_of_death_confidence ?? '',
            ultimate_cause_of_death_id: a.ultimate_cause_of_death_id ?? '',
            ultimate_predated_by_taxon_id: a.ultimate_predated_by_taxon_id ?? '',
            projection_mode: 'wgs',
            location_id: a.location_id ?? undefined
          })),
          collectionUnits: existingCritter.collection_units.map((a) => ({
            ...a,
            _id: v4()
          })),
          measurements: [
            ...existingCritter.measurement.qualitative.map((a) => ({
              ...a,
              measurement_quantitative_id: undefined,
              _id: v4(),
              value: undefined,
              measured_timestamp: a.measured_timestamp ? new Date(a.measured_timestamp) : ('' as unknown as Date),
              measurement_comment: a.measurement_comment ?? ''
            })),
            ...existingCritter.measurement.quantitative.map((a) => ({
              ...a,
              _id: v4(),
              measurement_qualitative_id: undefined,
              qualitative_option_id: undefined,
              measured_timestamp: a.measured_timestamp ? new Date(a.measured_timestamp) : ('' as unknown as Date),
              measurement_comment: a.measurement_comment ?? ''
            }))
          ],
          family: [
            ...existingCritter.family_child.map((ch) => ({
              _id: v4(),
              family_id: ch.family_id,
              relationship: 'child'
            })),
            ...existingCritter.family_parent.map((par) => ({
              _id: v4(),
              family_id: par.family_id,
              relationship: 'parent'
            }))
          ],
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

  const arrDiff = <T extends Record<K, any>, V extends Record<K, any>, K extends keyof T & keyof V>(
    arr1: T[],
    arr2: V[],
    key: K
  ) => {
    return arr1.filter((a1: Record<K, any>) => !arr2.some((a2: Record<K, any>) => a1[key] === a2[key]));
  };

  const handleCritterSave = async (currentFormValues: IAnimal) => {
    const postCritterPayload = async () => {
      const critter = new Critter(currentFormValues);
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
    const patchCritterPayload = async () => {
      const initialFormValues = obtainAnimalFormInitialvalues(ANIMAL_FORM_MODE.EDIT);
      const initialCritter = new Critter(initialFormValues);
      const createCritter = new Critter({
        ...currentFormValues,
        captures: currentFormValues.captures.filter((a) => !a.capture_id),
        mortality: currentFormValues.mortality.filter((a) => !a.mortality_id),
        markings: currentFormValues.markings.filter((a) => !a.marking_id),
        measurements: currentFormValues.measurements.filter(
          (a) => !a.measurement_qualitative_id && !a.measurement_quantitative_id
        ),
        collectionUnits: currentFormValues.collectionUnits.filter((a) => !a.critter_collection_unit_id),
        family: []
      });
      const updateCritter = new Critter({
        ...currentFormValues,
        captures: currentFormValues.captures.filter((a) => a.capture_id),
        mortality: currentFormValues.mortality.filter((a) => a.mortality_id),
        markings: currentFormValues.markings.filter((a) => a.marking_id),
        measurements: currentFormValues.measurements.filter(
          (a) => a.measurement_qualitative_id || a.measurement_quantitative_id
        ),
        collectionUnits: currentFormValues.collectionUnits.filter((a) => a.critter_collection_unit_id),
        family: []
      });

      initialFormValues.family.forEach((prevFam) => {
        if (
          !currentFormValues.family.some(
            (currFam) => currFam.family_id === prevFam.family_id && currFam.relationship === prevFam.relationship
          )
        ) {
          prevFam.relationship === 'parent'
            ? updateCritter.families.parents.push({
                family_id: prevFam.family_id,
                parent_critter_id: initialCritter.critter_id,
                _delete: true
              })
            : updateCritter.families.children.push({
                family_id: prevFam.family_id,
                child_critter_id: initialCritter.critter_id,
                _delete: true
              });
        }
      });

      currentFormValues.family.forEach((currFam) => {
        if (
          !initialFormValues.family.some(
            (prevFam) => currFam.family_id === prevFam.family_id && currFam.relationship === prevFam.relationship
          )
        ) {
          currFam.relationship === 'parent'
            ? createCritter.families.parents.push({
                family_id: currFam.family_id,
                parent_critter_id: initialCritter.critter_id
              })
            : createCritter.families.children.push({
                family_id: currFam.family_id,
                child_critter_id: initialCritter.critter_id
              });
        }
      });

      updateCritter.captures.push(
        ...arrDiff(initialCritter.captures, updateCritter.captures, 'capture_id').map((cap) => ({
          ...cap,
          _delete: true
        }))
      );
      updateCritter.mortalities.push(
        ...arrDiff(initialCritter.mortalities, updateCritter.mortalities, 'mortality_id').map((mort) => ({
          ...mort,
          _delete: true
        }))
      );
      updateCritter.collections.push(
        ...arrDiff(initialCritter.collections, updateCritter.collections, 'critter_collection_unit_id').map((col) => ({
          ...col,
          _delete: true
        }))
      );
      updateCritter.markings.push(
        ...arrDiff(initialCritter.markings, updateCritter.markings, 'marking_id').map((mark) => ({
          ...mark,
          _delete: true
        }))
      );
      updateCritter.measurements.qualitative.push(
        ...arrDiff(
          initialCritter.measurements.qualitative,
          updateCritter.measurements.qualitative,
          'measurement_qualitative_id'
        ).map((meas) => ({ ...meas, _delete: true }))
      );
      updateCritter.measurements.quantitative.push(
        ...arrDiff(
          initialCritter.measurements.quantitative,
          updateCritter.measurements.quantitative,
          'measurement_quantitative_id'
        ).map((meas) => ({ ...meas, _delete: true }))
      );

      console.log('initialValues: ' + JSON.stringify(initialCritter, null, 2));
      console.log('Create critter:' + JSON.stringify(createCritter, null, 2));
      console.log('Update critter:' + JSON.stringify(updateCritter, null, 2));
      await bhApi.survey.updateSurveyCritter(projectId, surveyId, updateCritter, createCritter);
      refreshCritters();
      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {'Animal data updated.'}
          </Typography>
        )
      });
      toggleDialog();
    };
    try {
      if (animalFormMode === ANIMAL_FORM_MODE.ADD) {
        await postCritterPayload();
      } else {
        await patchCritterPayload();
      }
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
          element: (
            <IndividualAnimalForm
              critter_id={currentCritterbaseCritterId}
              mode={animalFormMode}
              getAnimalCount={setAnimalCount}
            />
          ),
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
