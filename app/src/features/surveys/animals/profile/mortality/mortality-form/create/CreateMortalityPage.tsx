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
import {
  isQualitativeMeasurementCreate,
  isQuantitativeMeasurementCreate
} from 'features/surveys/animals/profile/measurements/utils';
import { AnimalMortalityForm } from 'features/surveys/animals/profile/mortality/mortality-form/components/AnimalMortalityForm';
import { formatLocation } from 'features/surveys/animals/profile/mortality/mortality-form/edit/utils';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateMortalityRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export const initialAnimalMortalityFormValues: ICreateMortalityRequest = {
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

/**
 * Page for creating a mortality record.
 *
 * @return {*}
 */
export const CreateMortalityPage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['critter_id']);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<ICreateMortalityRequest>>(null);

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
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
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
   * Creates an Mortality
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateMortalityRequest) => {
    setIsSaving(true);

    try {
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id;

      if (!values || !critterbaseCritterId) {
        return;
      }

      const mortalityLocation = formatLocation(values.mortality.location);

      const mortalityTime = values.mortality.mortality_time
        ? ` ${values.mortality.mortality_time}-07:00`
        : 'T00:00:00-07:00';
      const mortalityTimestamp = dayjs(`${values.mortality.mortality_date}${mortalityTime}`).toDate();

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
          mortality_id: mortalityResponse.mortality_id
        })),
        qualitative_measurements: values.measurements
          .filter(isQualitativeMeasurementCreate)
          // Format qualitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            mortality_id: mortalityResponse.mortality_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            qualitative_option_id: measurement.qualitative_option_id
          })),
        quantitative_measurements: values.measurements
          .filter(isQuantitativeMeasurementCreate)
          // Format quantitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            mortality_id: mortalityResponse.mortality_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            value: measurement.value
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
      animalPageContext.critterDataLoader.refresh(projectId, surveyId, surveyCritterId);

      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`, SKIP_CONFIRMATION_DIALOG);
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
      <Prompt when={true} message={locationChangeInterceptor} />
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
            handleSubmit={(values) => handleSubmit(values)}
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
