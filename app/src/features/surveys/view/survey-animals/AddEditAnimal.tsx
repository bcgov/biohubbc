import { mdiContentCopy, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArray, FieldArrayRenderProps, Form, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { dateRangesOverlap } from 'utils/Utils';
import { setPopup } from 'utils/UtilsJSX';
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
import { MeasurementFormContent } from './form-sections/MeasurementAnimalForm';
import { MortalityAnimalFormContent } from './form-sections/MortalityAnimalForm';
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
  const { submitForm, initialValues, values, setFieldValue } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openedFromAddButton, setOpenedFromAddButton] = useState(false);

  const { survey_critter_id } = useParams<{ survey_critter_id?: string }>();

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
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalFormContent name={'markings'} index={selectedIndex} />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: (
        <MeasurementFormContent index={selectedIndex} measurements={measurements} />
      ),
      [SurveyAnimalsI18N.animalCaptureTitle]: (
        <CaptureAnimalFormContent name={'captures'} index={selectedIndex} value={values.captures[selectedIndex]} />
      ),
      [SurveyAnimalsI18N.animalMortalityTitle]: (
        <MortalityAnimalFormContent name={'mortality'} index={selectedIndex} value={values.mortality[selectedIndex]} />
      ),
      [SurveyAnimalsI18N.animalFamilyTitle]: (
        <FamilyAnimalFormContent name={'family'} index={selectedIndex} allFamilies={allFamilies} />
      ),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: (
        <CollectionUnitAnimalFormContent name={'collectionUnits'} index={selectedIndex} />
      ),
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
          }}
        />
      )
    };
    const gridWrappedComp =
      section === 'Telemetry' ? (
        sectionMap[section]
      ) : (
        <Grid container spacing={2}>
          {sectionMap[section]}
        </Grid>
      );
    return gridWrappedComp ?? <Typography>Unimplemented</Typography>;
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

  return (
    <>
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc',
          '& button': {
            minWidth: '6rem'
          },
          '& button + button': {
            ml: 1
          }
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          {values?.general?.animal_id ? `Animal Details > ${section}` : 'Animal Details'}
        </Typography>
        <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
          {({ push, remove }: FieldArrayRenderProps) => (
            <>
              <EditDialog
                dialogTitle={dialogTitle}
                dialogText={ANIMAL_SECTIONS_FORM_MAP[section].infoText}
                open={showDialog}
                dialogSaveButtonLabel={openedFromAddButton ? 'Add' : 'Update'}
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
                    const vals = openedFromAddButton ? [saveVals.device[selectedIndex]] : saveVals.device;
                    try {
                      await telemetrySaveAction(
                        vals,
                        openedFromAddButton ? TELEMETRY_DEVICE_FORM_MODE.ADD : TELEMETRY_DEVICE_FORM_MODE.EDIT
                      );
                    } catch (err) {
                      setPopup('Telemetry save failed!', dialogContext);
                    }
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
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOpenedFromAddButton(true);
                    push(ANIMAL_SECTIONS_FORM_MAP[section]?.defaultFormValue());
                    setSelectedIndex((values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName] as any)['length'] ?? 0);
                    setShowDialog(true);
                  }}>
                  {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                </Button>
              ) : null}
            </>
          )}
        </FieldArray>
      </Toolbar>
      <Grid container flexDirection="column" px={3} py={2} alignItems="center">
        <Grid item container spacing={2} mb={2} lg={7} md={10} sm={12}>
          {values.general.critter_id ? (
            <>
              <Grid item lg={6} md={12}>
                <Typography variant="body1" color="textSecondary" maxWidth={'92ch'}>
                  {ANIMAL_SECTIONS_FORM_MAP[section].infoText}
                </Typography>
              </Grid>
              <Grid item lg={6} md={12} sm={12}>
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
                            setPopup('Copied Critter ID', dialogContext);
                          }}>
                          <Icon path={mdiContentCopy} size={0.8} />
                        </IconButton>
                      )
                    },
                    disabled: true
                  }}
                />
              </Grid>
              <Grid item lg={12} md={12} sm={12}>
                <Form>
                  <AnimalSectionDataCards
                    key={section}
                    onEditClick={(idx) => {
                      setSelectedIndex(idx);
                      setShowDialog(true);
                    }}
                    section={section}
                    isAddingNew={openedFromAddButton}
                    allFamilies={allFamilies}
                  />
                </Form>
              </Grid>
            </>
          ) : (
            <Grid item>
              <Typography component="span" variant="body2" color="textSecondary">
                No Critter Selected
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};
