import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress } from '@mui/material';
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
import { EditCaptureI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import AnimalCaptureForm from '../create/form/AnimalCaptureForm';

/**
 * Returns the page for editing an animal capture
 *
 * @returns
 */
const EditCapturePage = () => {
  const critterbaseApi = useCritterbaseApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);
  const captureId: string | undefined = String(urlParams['capture_id']);

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const history = useHistory();

  const formikRef = useRef<FormikProps<ICreateCaptureRequest>>(null);

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const captureDataLoader = useDataLoader(() => critterbaseApi.capture.getCapture(captureId));

  if (!captureDataLoader.data) {
    captureDataLoader.load();
  }

  const capture = captureDataLoader.data;

  if (!capture) {
    return <CircularProgress size={40} className="pageProgress" />;
  }

  const [captureDate, captureTimeTz] = capture.capture_timestamp.split('T');
  const [captureTime, captureTimeOffset] = captureTimeTz.split('-');

  const initialFormikValues: ICreateCaptureRequest = {
    capture: {
      capture_id: capture.capture_id,
      capture_comment: capture.capture_comment ?? '',
      capture_timestamp: capture.capture_timestamp,
      capture_date: captureDate,
      capture_time: captureTime + captureTimeOffset,
      capture_location: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [capture.capture_location.longitude, capture.capture_location.latitude]
        },
        properties: {}
      },
      release_location: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [capture.release_location?.longitude ?? 0, capture.release_location?.latitude ?? 0]
        },
        properties: {}
      },
      release_timestamp: capture.release_timestamp ?? '',
      release_comment: capture.release_comment ?? ''
    },
    markings: [],
    measurements: {
      quantitative: [],
      qualitative: []
    }
  };

  const { projectId, surveyId } = surveyContext;

  // If the user has refreshed the page and cleared the context, or come to this page externally from a link,
  // use the url params to set the select animal in the context. The context then requests critter data from critterbase.
  if (!animalPageContext.selectedAnimal) {
    animalPageContext.setSelectedAnimalFromSurveyCritterId(surveyCritterId);
  }

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: EditCaptureI18N.cancelTitle,
    dialogText: EditCaptureI18N.cancelText,
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
      dialogTitle: EditCaptureI18N.createErrorTitle,
      dialogText: EditCaptureI18N.createErrorText,
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
        values.capture.release_location &&
        values.capture.release_location.geometry &&
        values.capture.release_location.geometry.type === 'Point'
          ? {
              longitude: values.capture.release_location.geometry.coordinates[0],
              latitude: values.capture.release_location.geometry.coordinates[1],
              coordinate_uncertainty: 0,
              coordinate_uncertainty_units: 'm'
            }
          : values.capture.capture_location;

      const captureTimestamp = dayjs(
        `${values.capture.capture_date}${
          values.capture.capture_time ? ` ${values.capture.capture_time}-07:00` : 'T00:00:00-07:00'
        }`
      ).toDate();

      // if release timestamp is null, use the capture timestamp, otherwise format it for critterbase
      const releaseTimestamp = dayjs(
        values.capture.release_date
          ? captureTimestamp
          : `${values.capture.release_date}${
              values.capture.release_time ? ` ${values.capture.release_time}-07:00` : 'T00:00:00-07:00'
            }`
      ).toDate();

      const response = await critterbaseApi.capture.createCapture({
        capture_id: undefined,
        capture_timestamp: captureTimestamp,
        release_timestamp: releaseTimestamp,
        capture_comment: values.capture.capture_comment ?? '',
        release_comment: values.capture.release_comment ?? '',
        capture_location: captureLocation,
        release_location: releaseLocation ?? captureLocation,
        critter_id: critterbaseCritterId
      });

      if (!response) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

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
        title="Edit Capture"
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
                Edit Capture
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
            initialCaptureData={initialFormikValues}
            handleSubmit={(formikData) => handleSubmit(formikData as ICreateCaptureRequest)}
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

export default EditCapturePage;
