import LoadingButton from '@mui/lab/LoadingButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { CreateMortalityI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { AnimalMortalityForm } from 'features/surveys/animals/profile/mortality/mortality-form/AnimalMortalityForm';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export const initialAnimalMortalityFormValues: ICreateEditMortalityRequest = {
  mortality: {
    mortality_id: '',
    mortality_timestamp: '',
    mortality_date: '',
    mortality_time: '',
    proximate_cause_of_death_id: null,
    proximate_cause_of_death_confidence: null,
    proximate_predated_by_itis_tsn: null,
    ultimate_cause_of_death_id: null,
    ultimate_cause_of_death_confidence: null,
    ultimate_predated_by_itis_tsn: null,
    mortality_comment: '',
    location: null
  },
  markings: [],
  measurements: []
};

const CreateMortalityPage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<ICreateEditMortalityRequest>>(null);

  const { projectId, surveyId } = surveyContext;

  // If the user has refreshed the page and cleared the context, or come to this page externally from a link,
  // use the url params to set the select animal in the context. The context then requests critter data from critterbase.
  useEffect(() => {
    if (animalPageContext.selectedAnimal || !surveyCritterId) {
      return;
    }

    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }, [animalPageContext, surveyCritterId]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: CreateMortalityI18N.cancelTitle,
    dialogText: CreateMortalityI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${projectId}`);
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateMortalityI18N.createErrorTitle,
      dialogText: CreateMortalityI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  /**
   * Creates an Mortality
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateEditMortalityRequest) => {
    setIsSaving(true);
    setEnableCancelCheck(false);

    try {
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id;

      if (!values || !critterbaseCritterId || values.mortality.location?.geometry.type !== 'Point') {
        return;
      }

      const mortalityLocation = {
        longitude: values.mortality.location.geometry.coordinates[0],
        latitude: values.mortality.location.geometry.coordinates[1],
        coordinate_uncertainty: 0,
        coordinate_uncertainty_units: 'm'
      };

      const mortalityTimestamp = dayjs(
        `${values.mortality.mortality_date}${
          values.mortality.mortality_time ? ` ${values.mortality.mortality_time}-07:00` : 'T00:00:00-07:00'
        }`
      ).toDate();

      const mortalityResponse = await critterbaseApi.mortality.createMortality({
        critter_id: critterbaseCritterId,
        mortality_id: undefined,
        mortality_timestamp: mortalityTimestamp,
        proximate_cause_of_death_id: values.mortality.proximate_cause_of_death_id,
        proximate_cause_of_death_confidence: values.mortality.proximate_cause_of_death_confidence,
        proximate_predated_by_itis_tsn: values.mortality.proximate_predated_by_itis_tsn,
        ultimate_cause_of_death_id: values.mortality.ultimate_cause_of_death_id,
        ultimate_cause_of_death_confidence: values.mortality.ultimate_cause_of_death_confidence,
        ultimate_predated_by_itis_tsn: values.mortality.ultimate_predated_by_itis_tsn,
        location: mortalityLocation,
        mortality_comment: values.mortality.mortality_comment
      });

      if (!mortalityResponse) {
        showCreateErrorDialog({
          dialogError: 'An error occurred while attempting to create the mortality record.',
          dialogErrorDetails: ['Mortality create failed']
        });
        return;
      }

      // Create new measurements added while editing the mortality
      const bulkResponse = await critterbaseApi.critters.bulkCreate({
        markings: values.markings.map((marking) => ({
          ...marking,
          marking_id: marking.marking_id,
          critter_id: critterbaseCritterId,
          capture_id: mortalityResponse.mortality_id
        })),
        qualitative_measurements: values.measurements
          .filter((measurement) => 'qualitative_option_id' in measurement && measurement.qualitative_option_id)
          // Format qualitative measurements for create
          .map((measurement) => ({
            ...measurement,
            mortality_id: mortalityResponse.mortality_id,
            measurement_qualitative_id:
              'measurement_qualitative_id' in measurement ? measurement.measurement_qualitative_id : null,
            qualitative_option_id: 'qualitative_option_id' in measurement ? measurement.qualitative_option_id : null
          })),
        quantitative_measurements: values.measurements
          .filter((measurement) => 'value' in measurement && measurement.taxon_measurement_id && measurement.value)
          // Format quantitative measurements for create
          .map((measurement) => ({
            ...measurement,
            mortality_id: mortalityResponse.mortality_id,
            measurement_quantitative_id:
              'measurement_quantitative_id' in measurement ? measurement.measurement_quantitative_id : null,
            value: 'value' in measurement ? measurement.value : 0
          }))
      });

      if (!bulkResponse) {
        showCreateErrorDialog({
          dialogError: 'An error occurred while attempting to create the mortality record.',
          dialogErrorDetails: ['Bulk create failed when creating measurements and markings']
        });
        return;
      }

      // Refresh page
      animalPageContext.critterDataLoader.refresh(critterbaseCritterId);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Survey',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    } finally {
      setIsSaving(false);
    }
  };

  const animalId = animalPageContext.critterDataLoader.data?.animal_id;

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Report Mortality"
        breadCrumbJSX={
          animalId ? (
            <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
              <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/`}>
                {projectContext.projectDataLoader.data?.projectData.project.project_name}
              </Link>
              <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/surveys/${surveyId}`}>
                {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
              </Link>
              <Link
                component={RouterLink}
                underline="hover"
                to={`/admin/projects/${projectId}/surveys/${surveyId}/animals`}>
                Manage Animals
              </Link>
              <Link
                component={RouterLink}
                underline="hover"
                to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`}>
                {animalId}
              </Link>
              <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
                Report Mortality
              </Typography>
            </Breadcrumbs>
          ) : (
            <SkeletonHorizontalStack />
          )
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              loading={isSaving}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <AnimalMortalityForm
            initialMortalityData={initialAnimalMortalityFormValues}
            handleSubmit={(formikData) => handleSubmit(formikData as ICreateEditMortalityRequest)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => {
                formikRef.current?.submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} variant="outlined" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateMortalityPage;