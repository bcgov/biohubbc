import { mdiContentCopy, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArray, FieldArrayRenderProps, Form, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual } from 'lodash-es';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { AnimalSchema, getAnimalFieldName, IAnimal, IAnimalGeneral } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
import { AnimalSectionDataCards } from './AnimalSectionDataCards';
import { IAnimalDeployment } from './device';
import { CaptureAnimalFormContent } from './form-sections/CaptureAnimalForm';
import { CollectionUnitAnimalFormContent } from './form-sections/CollectionUnitAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { MarkingAnimalFormContent } from './form-sections/MarkingAnimalForm';
import { MeasurementFormContent } from './form-sections/MeasurementAnimalForm';
import { MortalityAnimalFormContent } from './form-sections/MortalityAnimalForm';
import { DeviceFormSection, IAnimalTelemetryDeviceFile, TELEMETRY_DEVICE_FORM_MODE } from './TelemetryDeviceForm';

interface AddEditAnimalProps {
  section: IAnimalSections;
  critterData?: IDetailedCritterWithInternalId[];
  deploymentData?: IAnimalDeployment[];
  isLoading?: boolean;
  telemetrySaveAction: (data: IAnimalTelemetryDeviceFile[], formMode: TELEMETRY_DEVICE_FORM_MODE) => Promise<void>;
  deploymentRemoveAction: (deploymentId: string) => void;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const { section, isLoading, critterData, telemetrySaveAction, deploymentRemoveAction } = props;
  const surveyContext = useContext(SurveyContext);
  const { survey_critter_id } = useParams<{ survey_critter_id: string }>();
  const { submitForm, initialValues, values, resetForm, setFieldValue } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);

  const critter = critterData?.find((cData) => cData.survey_critter_id === parseInt(survey_critter_id));

  const [showDialog, setShowDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openedFromAddButton, setOpenedFromAddButton] = useState(false);

  const dialogTitle = openedFromAddButton ? `Adding ${section}` : `Editing ${section}`;

  const cbApi = useCritterbaseApi();

  //const { data: allFamilies, refresh: refreshFamilies } = useDataLoader(cbApi.family.getAllFamilies);

  /*if (!allFamilies) {
    refreshFamilies();
  }*/

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
        /*<FamilyAnimalFormContent name={'family'} index={selectedIndex} allFamilies={allFamilies} />*/ <Typography>
          Unimplemented
        </Typography>
      ),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: (
        <CollectionUnitAnimalFormContent name={'collectionUnits'} index={selectedIndex} />
      ),
      Telemetry: (
        <DeviceFormSection
          values={values.device}
          mode={openedFromAddButton ? TELEMETRY_DEVICE_FORM_MODE.ADD : TELEMETRY_DEVICE_FORM_MODE.EDIT}
          index={selectedIndex}
          removeAction={deploymentRemoveAction}
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
    deploymentRemoveAction,
    measurements,
    openedFromAddButton,
    section,
    selectedIndex,
    values.captures,
    values.device,
    values.mortality
  ]);

  const setPopup = (message: string) => {
    dialogContext.setSnackbar({
      open: true,
      snackbarAutoCloseMs: 1500,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      )
    });
  };

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
        <Box
          sx={{
            '& div:first-of-type': {
              display: 'flex',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }
          }}>
          <Box display="flex" overflow="hidden">
            <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
              {({ push, remove }: FieldArrayRenderProps) => (
                <>
                  <EditDialog
                    dialogTitle={dialogTitle}
                    open={showDialog}
                    component={{
                      initialValues: values,
                      element: renderSingleForm,
                      validationSchema: AnimalSchema
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
                          setPopup('Telemetry save failed!');
                        }
                      }
                      setOpenedFromAddButton(false);
                      setShowDialog(false);
                      setFieldValue(
                        ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName,
                        saveVals[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName]
                      );
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
                        setSelectedIndex(
                          (values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName] as any)['length'] ?? 0
                        );
                        setShowDialog(true);
                      }}>
                      {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                    </Button>
                  ) : null}
                </>
              )}
            </FieldArray>
            <Collapse in={!isEqual(initialValues, values) && section !== 'Telemetry'} orientation="horizontal">
              <Box ml={1} whiteSpace="nowrap">
                <LoadingButton loading={isLoading} variant="contained" color="primary" onClick={() => submitForm()}>
                  Save
                </LoadingButton>
                <Button variant="outlined" color="primary" onClick={() => resetForm()}>
                  Discard Changes
                </Button>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Toolbar>
      <Box p={2}>
        {values.general.critter_id ? (
          <Grid container>
            <Grid item mb={2} lg={4} sm={12} md={8}>
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
                          setPopup('Copied Critter ID');
                        }}>
                        <Icon path={mdiContentCopy} size={0.8} />
                      </IconButton>
                    )
                  },
                  disabled: true,
                  variant: 'filled'
                }}
              />
            </Grid>
          </Grid>
        ) : null}
        <Form>
          {critter && (
            <AnimalSectionDataCards
              onEditClick={(idx) => {
                setSelectedIndex(idx);
                setShowDialog(true);
              }}
              section={section}
              critter={critter}
            />
          )}
        </Form>
      </Box>
    </>
  );
};
