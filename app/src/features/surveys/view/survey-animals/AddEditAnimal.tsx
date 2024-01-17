import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useMemo, useState } from 'react';
import { setMessageSnackbar } from 'utils/Utils';
import { ANIMAL_FORM_MODE, IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
import { AnimalSectionDataCards } from './AnimalSectionDataCards';
import { CaptureAnimalFormContent } from './form-sections/CaptureAnimalForm';
import { CollectionUnitAnimalFormContent } from './form-sections/CollectionUnitAnimalForm';
import { FamilyAnimalFormContent } from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { MarkingAnimalFormContent } from './form-sections/MarkingAnimalForm';
import MeasurementAnimalFormContent from './form-sections/MeasurementAnimalForm';
import { MortalityAnimalFormContent } from './form-sections/MortalityAnimalForm';
import { IAnimalDeployment, IAnimalTelemetryDeviceFile } from './telemetry-device/device';
import TelemetryDeviceFormContent from './telemetry-device/TelemetryDeviceFormContent';

interface IAddEditAnimalProps {
  section: IAnimalSections;
  critterData?: IDetailedCritterWithInternalId[];
  deploymentData?: IAnimalDeployment[];
  telemetrySaveAction: (data: IAnimalTelemetryDeviceFile[], formMode: ANIMAL_FORM_MODE) => Promise<void>;
  deploymentRemoveAction: (deploymentId: string) => void;
  formikArrayHelpers: FieldArrayRenderProps;
}

export const AddEditAnimal = (props: IAddEditAnimalProps) => {
  const { section, critterData, telemetrySaveAction, deploymentRemoveAction, formikArrayHelpers } = props;

  const theme = useTheme();
  const telemetryApi = useTelemetryApi();
  const cbApi = useCritterbaseApi();
  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);
  const { cid: survey_critter_id } = useQuery();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { submitForm, isValid, resetForm, values, isSubmitting, initialValues, isValidating, status } =
    useFormikContext<IAnimal>();

  const { data: allFamilies, refresh: refreshFamilies } = useDataLoader(cbApi.family.getAllFamilies);
  const { refresh: refreshDeviceDetails } = useDataLoader(telemetryApi.devices.getDeviceDetails);
  const { data: measurements, refresh: refreshMeasurements } = useDataLoader(cbApi.lookup.getTaxonMeasurements);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [formMode, setFormMode] = useState<ANIMAL_FORM_MODE>(ANIMAL_FORM_MODE.EDIT);

  const dialogTitle =
    formMode === ANIMAL_FORM_MODE.ADD
      ? `Add ${ANIMAL_SECTIONS_FORM_MAP[section].dialogTitle}`
      : `Edit ${ANIMAL_SECTIONS_FORM_MAP[section].dialogTitle}`;

  useEffect(() => {
    refreshFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [critterData]);

  useEffect(() => {
    refreshMeasurements(values.general.taxon_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.general.taxon_id]);

  useEffect(() => {
    if (!status?.success && status?.msg) {
      // if the status of the request fails reset the form
      resetForm();
    }
  }, [initialValues, resetForm, status]);

  const renderSingleForm = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <GeneralAnimalForm />,
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: (
        <MeasurementAnimalFormContent index={selectedIndex} measurements={measurements} mode={formMode} />
      ),
      [SurveyAnimalsI18N.animalCaptureTitle]: <CaptureAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalMortalityTitle]: <MortalityAnimalFormContent index={selectedIndex} />,
      [SurveyAnimalsI18N.animalFamilyTitle]: (
        <FamilyAnimalFormContent index={selectedIndex} allFamilies={allFamilies} />
      ),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <CollectionUnitAnimalFormContent index={selectedIndex} />,
      Telemetry: <TelemetryDeviceFormContent index={selectedIndex} mode={formMode} />
    };
    return sectionMap[section];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allFamilies,
    deploymentRemoveAction,
    measurements,
    props.deploymentData,
    formMode,
    section,
    selectedIndex,
    survey_critter_id,
    values.captures,
    values.device,
    values.mortality
  ]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSaveTelemetry = async (saveValues: IAnimal) => {
    const vals = formMode === ANIMAL_FORM_MODE.ADD ? [saveValues.device[selectedIndex]] : saveValues.device;
    try {
      await telemetrySaveAction(vals, formMode);
      refreshDeviceDetails(Number(saveValues.device[selectedIndex].device_id));
    } catch (err) {
      setMessageSnackbar('Telemetry save failed!', dialogContext);
    }
  };

  return (
    <Paper component={Stack} position="absolute" top={0} right={0} bottom={0} left={0} overflow="hidden">
      <Toolbar
        disableGutters
        sx={{
          px: 2
        }}>
        <Typography variant="h3" component="h2">
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
            <Box display="flex" flexDirection="row" alignItems="flex-start" mb={2}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  flex: '1 1 auto'
                }}>
                {section}
              </Typography>

              {/* Not using EditDialog due to the parent component needing the formik state */}
              <Dialog
                open={showDialog}
                fullScreen={fullScreen}
                maxWidth="xl"
                onTransitionExited={() => {
                  if (formMode === ANIMAL_FORM_MODE.ADD) {
                    formikArrayHelpers.remove(selectedIndex);
                  }
                  setFormMode(ANIMAL_FORM_MODE.EDIT);
                }}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>{renderSingleForm}</DialogContent>
                <DialogActions>
                  <LoadingButton
                    color="primary"
                    variant="contained"
                    disabled={!isValid}
                    onClick={async () => {
                      if (section === 'Telemetry') {
                        await handleSaveTelemetry(values);
                      } else {
                        submitForm();
                      }
                      setFormMode(ANIMAL_FORM_MODE.EDIT);
                      setShowDialog(false);
                    }}
                    loading={isValidating || isSubmitting || !!status}>
                    Save
                  </LoadingButton>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                      setShowDialog(false);
                    }}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
              {!ANIMAL_SECTIONS_FORM_MAP[section]?.addBtnText ||
              (section === 'Mortality Events' && initialValues.mortality.length >= 1) ? null : (
                <Button
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setFormMode(ANIMAL_FORM_MODE.ADD);
                    const animalData = ANIMAL_SECTIONS_FORM_MAP[section];
                    const sectionValues = values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName];
                    const defaultValue = animalData?.defaultFormValue();
                    setSelectedIndex((sectionValues as any)['length'] ?? 0);
                    formikArrayHelpers.push(defaultValue);
                    setShowDialog(true);
                  }}>
                  {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                </Button>
              )}
            </Box>

            <Typography
              variant="body1"
              color="textSecondary"
              maxWidth={'88ch'}
              sx={{
                mb: 5
              }}>
              {ANIMAL_SECTIONS_FORM_MAP[section].infoText}
            </Typography>

            <AnimalSectionDataCards
              key={section}
              onEditClick={(idx) => {
                setSelectedIndex(idx);
                setShowDialog(true);
              }}
              section={section}
              allFamilies={allFamilies}
            />
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
            overflowY: 'auto',
            background: grey[100]
          }}>
          <Typography component="span" variant="body2">
            No Animal Selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
