import { mdiContentCopy, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Divider, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/system/Stack';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArray, FieldArrayRenderProps, Form, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useMemo, useState } from 'react';
import { dateRangesOverlap, setMessageSnackbar } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { AnimalSchema, getAnimalFieldName, IAnimal, IAnimalGeneral } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
import { AnimalSectionDataCards } from './AnimalSectionDataCards';
import { AnimalDeploymentTimespanSchema, AnimalTelemetryDeviceSchema, IAnimalDeployment } from './device';
import { CaptureAnimalFormContent } from './form-sections/CaptureAnimalForm';
import { CollectionUnitAnimalFormContent } from './form-sections/CollectionUnitAnimalForm';
import { FamilyAnimalFormContent } from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { MarkingAnimalFormContent } from './form-sections/MarkingAnimalForm';
import MeasurementAnimalFormContent from './form-sections/MeasurementAnimalForm';
import { MortalityAnimalFormContent } from './form-sections/MortalityAnimalForm';
import { IAnimalStatus } from './SurveyAnimalsPage';
import { DeviceFormSection, IAnimalTelemetryDeviceFile, TELEMETRY_DEVICE_FORM_MODE } from './TelemetryDeviceForm';

interface AddEditAnimalProps {
  section: IAnimalSections;
  critterData?: IDetailedCritterWithInternalId[];
  deploymentData?: IAnimalDeployment[];
  telemetrySaveAction: (data: IAnimalTelemetryDeviceFile[], formMode: TELEMETRY_DEVICE_FORM_MODE) => Promise<void>;
  deploymentRemoveAction: (deploymentId: string) => void;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const { section, critterData, telemetrySaveAction, deploymentRemoveAction } = props;
  const surveyContext = useContext(SurveyContext);
  const { submitForm, initialValues, setStatus, values, setFieldValue } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openedFromAddButton, setOpenedFromAddButton] = useState(false);

  const { cid: survey_critter_id } = useQuery();

  const dialogTitle = openedFromAddButton
    ? `Add ${ANIMAL_SECTIONS_FORM_MAP[section].dialogTitle}`
    : `Edit ${ANIMAL_SECTIONS_FORM_MAP[section].dialogTitle}`;

  const cbApi = useCritterbaseApi();
  const telemetryApi = useTelemetryApi();

  const { data: allFamilies, refresh: refreshFamilies } = useDataLoader(cbApi.family.getAllFamilies);

  useEffect(() => {
    refreshFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [critterData]);

  const { data: measurements, refresh: refreshMeasurements } = useDataLoader(cbApi.lookup.getTaxonMeasurements);
  useEffect(() => {
    refreshMeasurements(values.general.taxon_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.general.taxon_id]);

  const renderSingleForm = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <GeneralAnimalForm />,
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: (
        <MeasurementAnimalFormContent index={selectedIndex} measurements={measurements} />
      ),
      [SurveyAnimalsI18N.animalCaptureTitle]: <CaptureAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalMortalityTitle]: <MortalityAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalFamilyTitle]: (
        <FamilyAnimalFormContent index={selectedIndex} allFamilies={allFamilies} />
      ),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <CollectionUnitAnimalFormContent index={selectedIndex} />,
      Telemetry: (
        <DeviceFormSection
          values={values.device}
          mode={openedFromAddButton ? TELEMETRY_DEVICE_FORM_MODE.ADD : TELEMETRY_DEVICE_FORM_MODE.EDIT}
          index={selectedIndex}
          removeAction={(id) => {
            deploymentRemoveAction(id);
            const deployments = props.deploymentData?.filter((a) => a.critter_id === survey_critter_id) ?? [];
            if (deployments.length <= 1) {
              setShowDialog(false);
            }
            refreshDeviceDetails(values.device[selectedIndex].device_id);
          }}
        />
      )
    };
    const gridWrappedComp = section === 'Telemetry' ? sectionMap[section] : <>{sectionMap[section]}</>;
    return gridWrappedComp ?? <Typography>Unimplemented</Typography>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allFamilies,
    deploymentRemoveAction,
    measurements,
    openedFromAddButton,
    props.deploymentData,
    section,
    selectedIndex,
    survey_critter_id,
    values.captures,
    values.device,
    values.mortality
  ]);

  const deploymentOverlapTest = async (
    device_id: number,
    deployment_id: string,
    attachment_start: string | undefined,
    attachment_end: string | null | undefined
  ): Promise<string> => {
    const deviceDetails = await getDeviceDetails(device_id);
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

  const { data: deviceDetails, refresh: refreshDeviceDetails } = useDataLoader(telemetryApi.devices.getDeviceDetails);
  const getDeviceDetails = async (deviceId: number | string) => {
    if (deviceDetails?.device?.device_id !== Number(deviceId)) {
      await refreshDeviceDetails(Number(deviceId));
      return deviceDetails;
    } else {
      return deviceDetails;
    }
  };

  const AnimalDeploymentSchemaAsyncValidation = AnimalTelemetryDeviceSchema.shape({
    device_make: yup
      .string()
      .required('Required')
      .test('checkDeviceMakeIsNotChanged', '', async (value, context) => {
        const upperLevelIndex = Number(context.path.match(/\[(\d+)\]/)?.[1]); //Searches device[0].deployments[0].attachment_start for the number contained in first index.
        if (selectedIndex !== upperLevelIndex) {
          return true;
        }
        const deviceDetails = await getDeviceDetails(context.parent.device_id);
        if (deviceDetails?.device?.device_make && deviceDetails.device?.device_make !== value) {
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
            const upperLevelIndex = Number(context.path.match(/\[(\d+)\]/)?.[1]); //Searches device[0].deployments[0].attachment_start for the number contained in first index.
            if (selectedIndex !== upperLevelIndex) {
              return true;
            }
            const deviceId = context.options.context?.device?.[upperLevelIndex]?.device_id;
            const errStr = await deploymentOverlapTest(
              deviceId,
              context.parent.deployment_id,
              value,
              context.parent.attachment_end
            );
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
            const upperLevelIndex = Number(context.path.match(/\[(\d+)\]/)?.[1]); //Searches device[0].deployments[0].attachment_start for the number contained in first index.
            if (selectedIndex !== upperLevelIndex) {
              return true;
            }
            const deviceId = context.options.context?.device?.[upperLevelIndex]?.device_id;
            const errStr = await deploymentOverlapTest(
              deviceId,
              context.parent.deployment_id,
              context.parent.attachment_start,
              value
            );
            if (errStr.length) {
              return context.createError({ message: errStr });
            } else {
              return true;
            }
          })
      })
    )
  });

  const AnimalSchemaWithDeployments = AnimalSchema.shape({
    device: yup.array().of(AnimalDeploymentSchemaAsyncValidation)
  });

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSaveTelemetry = async (saveValues: IAnimal) => {
    const vals = openedFromAddButton ? [saveValues.device[selectedIndex]] : saveValues.device;
    try {
      await telemetrySaveAction(
        vals,
        openedFromAddButton ? TELEMETRY_DEVICE_FORM_MODE.ADD : TELEMETRY_DEVICE_FORM_MODE.EDIT
      );
      refreshDeviceDetails(Number(saveValues.device[selectedIndex].device_id));
    } catch (err) {
      setMessageSnackbar('Telemetry save failed!', dialogContext);
    }
  };

  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0
      }}>
      <Toolbar
        sx={{
          position: 'sticky',
          top: 0,
          '& button': {
            minWidth: '6rem'
          },
          '& button + button': {
            ml: 1
          }
        }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{
            flexGrow: '1',
            fontWeight: 700
          }}>
          {values?.general?.animal_id ? `Animal Details > ${values.general.animal_id}` : 'No animal selected'}
        </Typography>
      </Toolbar>

      <Divider flexItem></Divider>

      {values.general.critter_id ? (
        <Box
          flex="1 1 auto"
          p={5}
          sx={{
            overflowY: 'auto',
            background: grey[100]
          }}>
          <Box
            sx={{
              maxWidth: '1200px',
              mx: 'auto'
            }}>
            <Box display="flex" flexDirection="row" alignItems="flex-start" mb={3}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  flex: '1 1 auto'
                }}>
                {section}
              </Typography>

              <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
                {({ push, remove }: FieldArrayRenderProps) => (
                  <>
                    <EditDialog
                      dialogTitle={dialogTitle}
                      open={showDialog}
                      dialogSaveButtonLabel={'Save'}
                      component={{
                        initialValues: values,
                        element: renderSingleForm,
                        validationSchema: AnimalSchemaWithDeployments
                      }}
                      onCancel={() => {
                        if (openedFromAddButton) {
                          remove(selectedIndex);
                        }
                        setOpenedFromAddButton(false);
                        setShowDialog(false);
                      }}
                      onSave={async (saveVals) => {
                        if (section === 'Telemetry') {
                          handleSaveTelemetry(saveVals);
                        }
                        setOpenedFromAddButton(false);
                        setShowDialog(false);
                        setFieldValue(
                          ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName,
                          saveVals[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName]
                        );
                        submitForm();
                      }}
                    />
                    {ANIMAL_SECTIONS_FORM_MAP[section]?.addBtnText ? (
                      <Button
                        sx={{ fontWeight: 700 }}
                        startIcon={<Icon path={mdiPlus} size={1} />}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setOpenedFromAddButton(true);
                          const animalData = ANIMAL_SECTIONS_FORM_MAP[section];
                          const sectionValues = values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName];
                          push(animalData?.defaultFormValue());
                          setSelectedIndex((sectionValues as any)['length'] ?? 0);
                          setShowDialog(true);
                        }}>
                        {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                      </Button>
                    ) : null}
                  </>
                )}
              </FieldArray>
            </Box>

            <Typography
              variant="body1"
              color="textSecondary"
              maxWidth={'110ch'}
              sx={{
                mb: 5
              }}>
              {ANIMAL_SECTIONS_FORM_MAP[section].infoText}
            </Typography>

            {section === SurveyAnimalsI18N.animalGeneralTitle ? (
              <CustomTextField
                label="Critter ID"
                name={getAnimalFieldName<IAnimalGeneral>('general', 'critter_id')}
                other={{
                  InputProps: {
                    endAdornment: (
                      <IconButton
                        aria-label={`Copy Critter ID`}
                        onClick={() => {
                          navigator.clipboard.writeText(initialValues.general?.critter_id ?? '');
                          setMessageSnackbar('Copied Critter ID', dialogContext);
                        }}>
                        <Icon path={mdiContentCopy} size={0.8} />
                      </IconButton>
                    )
                  },
                  disabled: true
                }}
              />
            ) : null}

            <Form>
              <AnimalSectionDataCards
                key={section}
                onEditClick={(idx) => {
                  setSelectedIndex(idx);
                  setShowDialog(true);
                }}
                section={section}
                allFamilies={allFamilies}
              />
            </Form>
            <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
              {({ push, remove }: FieldArrayRenderProps) => (
                <>
                  <EditDialog
                    dialogTitle={dialogTitle}
                    open={showDialog}
                    dialogSaveButtonLabel={'Save'}
                    component={{
                      initialValues: values,
                      element: renderSingleForm,
                      validationSchema: AnimalSchemaWithDeployments
                    }}
                    onCancel={() => {
                      if (openedFromAddButton) {
                        remove(selectedIndex);
                      }
                      setOpenedFromAddButton(false);
                      setShowDialog(false);
                    }}
                    onSave={async (saveVals) => {
                      const animalStatus: IAnimalStatus = { isLoading: true };
                      setStatus(animalStatus);
                      if (section === 'Telemetry') {
                        handleSaveTelemetry(saveVals);
                      }
                      setOpenedFromAddButton(false);
                      setShowDialog(false);
                      setFieldValue(
                        ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName,
                        saveVals[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName]
                      );
                      submitForm();
                    }}
                  />
                  {ANIMAL_SECTIONS_FORM_MAP[section]?.addBtnText ? (
                    <Button
                      sx={{ mt: 2 }}
                      startIcon={<Icon path={mdiPlus} size={1} />}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setOpenedFromAddButton(true);
                        const animalData = ANIMAL_SECTIONS_FORM_MAP[section];
                        const sectionValues = values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName];
                        push(animalData?.defaultFormValue());
                        setSelectedIndex((sectionValues as any)['length'] ?? 0);
                        setShowDialog(true);
                      }}>
                      {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                    </Button>
                  ) : null}
                </>
              )}
            </FieldArray>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex="1 1 auto"
          p={3}
          sx={{
            overflowY: 'scroll',
            background: grey[100]
          }}>
          <Typography component="span" variant="body2">
            No Critter Selected
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
