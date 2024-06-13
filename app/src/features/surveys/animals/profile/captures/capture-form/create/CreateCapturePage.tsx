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
import { CreateCaptureI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { AnimalCaptureForm } from 'features/surveys/animals/profile/captures/capture-form/components/AnimalCaptureForm';
import {
  isQualitativeMeasurementCreate,
  isQuantitativeMeasurementCreate
} from 'features/surveys/animals/profile/measurements/utils';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export const defaultAnimalCaptureFormValues: ICreateCaptureRequest = {
  capture: {
    capture_id: '',
    capture_timestamp: '',
    capture_date: '',
    capture_time: '',
    release_timestamp: '',
    release_date: '',
    release_time: '',
    capture_comment: '',
    release_comment: '',
    capture_location: null,
    release_location: null
  },
  markings: [],
  measurements: []
};

/**
 * Page for creating an animal capture record.
 *
 * @returns
 */
export const CreateCapturePage = () => {
  const history = useHistory();

  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSaving, setIsSaving] = useState(false);

  const formikRef = useRef<FormikProps<ICreateCaptureRequest>>(null);

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
      dialogTitle: CreateCaptureI18N.createErrorTitle,
      dialogText: CreateCaptureI18N.createErrorText,
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
   * Creates an Capture
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateCaptureRequest) => {
    setIsSaving(true);

    try {
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id;

      if (!values || !critterbaseCritterId || values.capture.capture_location?.geometry.type !== 'Point') {
        return;
      }

      const captureLocation = {
        longitude: values.capture.capture_location.geometry.coordinates[0],
        latitude: values.capture.capture_location.geometry.coordinates[1],
        coordinate_uncertainty: 0,
        coordinate_uncertainty_units: 'm'
      };

      // if release location is null, use the capture location, otherwise format it for critterbase
      const releaseLocation =
        values.capture.release_location?.geometry?.type === 'Point'
          ? {
              longitude: values.capture.release_location.geometry.coordinates[0],
              latitude: values.capture.release_location.geometry.coordinates[1],
              coordinate_uncertainty: 0,
              coordinate_uncertainty_units: 'm'
            }
          : captureLocation;

      const captureTime = values.capture.capture_time ? ` ${values.capture.capture_time}-07:00` : 'T00:00:00-07:00';
      const captureTimestamp = dayjs(`${values.capture.capture_date}${captureTime}`).toDate();

      // if release timestamp is null, use the capture timestamp, otherwise format it for critterbase
      const releaseTime = values.capture.release_time ? ` ${values.capture.release_time}-07:00` : captureTime;
      const releaseTimestamp = values.capture.release_date
        ? dayjs(`${values.capture.release_date}${releaseTime}`).toDate()
        : captureTimestamp;

      // Must create capture first to avoid foreign key constraints. Can't guarantee that the capture is
      // inserted before the measurements/markings.
      const captureResponse = await critterbaseApi.capture.createCapture({
        critter_id: critterbaseCritterId,
        capture_id: undefined,
        capture_timestamp: captureTimestamp,
        release_timestamp: releaseTimestamp,
        capture_comment: values.capture.capture_comment ?? '',
        release_comment: values.capture.release_comment ?? '',
        capture_location: captureLocation,
        release_location: releaseLocation ?? captureLocation
      });

      if (!captureResponse) {
        showCreateErrorDialog({
          dialogError: 'An error occurred while attempting to create the capture record.',
          dialogErrorDetails: ['Capture create failed']
        });
        return;
      }

      // Create new measurements added while editing the capture
      const bulkResponse = await critterbaseApi.critters.bulkCreate({
        markings: values.markings.map((marking) => ({
          ...marking,
          marking_id: marking.marking_id,
          critter_id: critterbaseCritterId,
          capture_id: captureResponse.capture_id
        })),
        qualitative_measurements: values.measurements
          .filter(isQualitativeMeasurementCreate)
          // Format qualitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            capture_id: captureResponse.capture_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            qualitative_option_id: measurement.qualitative_option_id
          })),
        quantitative_measurements: values.measurements
          .filter(isQuantitativeMeasurementCreate)
          // Format quantitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            capture_id: captureResponse.capture_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            value: measurement.value
          }))
      });

      if (!bulkResponse) {
        showCreateErrorDialog({
          dialogError: 'An error occurred while attempting to create the capture record.',
          dialogErrorDetails: ['Bulk create failed when creating measurements and markings']
        });
        return;
      }

      // Refresh page
      animalPageContext.critterDataLoader.refresh(critterbaseCritterId);

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
        title="Create New Capture"
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
                Create New Capture
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
          <AnimalCaptureForm
            initialCaptureData={defaultAnimalCaptureFormValues}
            handleSubmit={(formikData) => handleSubmit(formikData)}
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
