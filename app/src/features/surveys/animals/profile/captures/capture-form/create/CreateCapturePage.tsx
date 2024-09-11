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
import { AnimalCaptureForm } from 'features/surveys/animals/profile/captures/capture-form/components/AnimalCaptureForm';
import {
  isQualitativeMeasurementCreate,
  isQuantitativeMeasurementCreate
} from 'features/surveys/animals/profile/measurements/utils';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateCaptureRequest, ILocationCreate } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';

export const defaultAnimalCaptureFormValues: ICreateCaptureRequest = {
  attachments: {
    capture_attachments: {}
  },
  capture: {
    capture_id: v4(),
    capture_date: '',
    capture_method_id: '',
    capture_time: '',
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

  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['critter_id']);

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
      const surveyCritterId = Number(animalPageContext.selectedAnimal?.critter_id);
      const critterbaseCritterId = String(animalPageContext.selectedAnimal?.critterbase_critter_id);

      if (!values || !critterbaseCritterId || values.capture.capture_location?.geometry.type !== 'Point') {
        return;
      }

      const captureLocations: ILocationCreate[] = [
        {
          location_id: v4(),
          longitude: values.capture.capture_location.geometry.coordinates[0],
          latitude: values.capture.capture_location.geometry.coordinates[1],
          coordinate_uncertainty: 0,
          coordinate_uncertainty_unit: 'm'
        }
      ];

      if (values.capture.release_location?.geometry.type === 'Point') {
        captureLocations.push({
          location_id: v4(),
          longitude: values.capture.release_location.geometry.coordinates[0],
          latitude: values.capture.release_location.geometry.coordinates[1],
          coordinate_uncertainty: 0,
          coordinate_uncertainty_unit: 'm'
        });
      }

      // TODO: Allow endpoint to accept multiple attachments
      const uploadCaptureAttachments = Object.values(values.attachments.capture_attachments).map((file) => {
        return biohubApi.animal.uploadCritterCaptureAttachment({
          critterId: surveyCritterId,
          critterbaseCaptureId: values.capture.capture_id,
          projectId,
          surveyId,
          file
        });
      });

      // Upload all the capture attachments
      await Promise.all(uploadCaptureAttachments).catch(() => {
        showCreateErrorDialog({
          dialogError: 'An error occurred while attempting to upload the Capture attachments.',
          dialogErrorDetails: ['Upload failed when uploading attachments']
        });
        return;
      });

      /**
       * Create the Capture, Markings, and Measurements and Locations in Critterbase.
       *
       * Note: Critterbase will add the data in the correct order to prevent foreign key constraints.
       */
      const bulkResponse = await critterbaseApi.critters.bulkCreate({
        locations: captureLocations,
        captures: [
          {
            critter_id: critterbaseCritterId,
            capture_id: values.capture.capture_id,
            capture_date: values.capture.capture_date,
            capture_time: values.capture.capture_time || undefined,
            release_date: values.capture.release_date || values.capture.capture_date,
            release_time: values.capture.release_time || values.capture.capture_time || undefined,
            capture_comment: values.capture.capture_comment || undefined,
            release_comment: values.capture.release_comment || undefined,
            capture_location_id: captureLocations[0].location_id,
            release_location_id:
              captureLocations.length > 1 ? captureLocations[1].location_id : captureLocations[0].location_id
          }
        ],
        markings: values.markings.map((marking) => ({
          ...marking,
          marking_id: marking.marking_id,
          critter_id: critterbaseCritterId,
          capture_id: values.capture.capture_id
        })),
        qualitative_measurements: values.measurements
          .filter(isQualitativeMeasurementCreate)
          // Format qualitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            capture_id: values.capture.capture_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            qualitative_option_id: measurement.qualitative_option_id
          })),
        quantitative_measurements: values.measurements
          .filter(isQuantitativeMeasurementCreate)
          // Format quantitative measurements for create
          .map((measurement) => ({
            critter_id: critterbaseCritterId,
            capture_id: values.capture.capture_id,
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

      if (surveyCritterId) {
        animalPageContext.critterDataLoader.refresh(projectId, surveyId, surveyCritterId);
      }

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
