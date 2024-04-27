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
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import AnimalCaptureForm from './form/AnimalCaptureForm';

export const defaultAnimalCaptureFormValues: ICreateCaptureRequest = {
  capture: {
    capture_id: '',
    capture_timestamp: new Date('2020-01-01'),
    release_timestamp: new Date('2020-01-05'),
    capture_comment: '',
    release_comment: '',
    capture_location: {
      latitude: null,
      longitude: null
    },
    release_location: undefined
  },
  markings: [],
  measurements: {
    quantitative: [],
    qualitative: []
  }
};

const CreateCapturePage = () => {
  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyCritterId: number | undefined = Number(urlParams['survey_critter_id']);

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const history = useHistory();

  const formikRef = useRef<FormikProps<ICreateCaptureRequest>>(null);

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();
  const animalPageContext = useAnimalPageContext();

  const { projectId, surveyId } = surveyContext;

  // If the user has refreshed the page and cleared the context, or come to this page externally from a link,
  // use the url params to set the select animal in the context. The context then requests critter data from critterbase.
  const surveyCrittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));
  if (!animalPageContext.critterDataLoader.data) {
    if (surveyCritterId) {
      surveyCrittersDataLoader.load();
    }
  }
  useEffect(() => {
    console.log(surveyCrittersDataLoader.data);
    if (surveyCrittersDataLoader.data) {
      const critterId = surveyCrittersDataLoader.data.find(
        (critter) => critter.survey_critter_id === surveyCritterId
      )?.critter_id;
      if (critterId && surveyCritterId) {
        animalPageContext.setSelectedAnimal({ survey_critter_id: surveyCritterId, critterbase_critter_id: critterId });
      }
    }
  }, [surveyCrittersDataLoader.data]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/${surveyCritterId}`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: CreateCaptureI18N.cancelTitle,
    dialogText: CreateCaptureI18N.cancelText,
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
      const critterbaseCritterId = animalPageContext.selectedAnimal?.critterbase_critter_id
      if (!values || !critterbaseCritterId) {
        return;
      }
      
      const response = await critterbaseApi.capture.createCapture({
        capture_id: undefined,
        capture_timestamp: values.capture.capture_timestamp,
        release_timestamp: values.capture.release_timestamp,
        capture_comment: values.capture.capture_comment,
        release_comment: values.capture.release_comment,
        capture_location: values.capture.capture_location,
        release_location: values.capture.release_location,
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
      animalPageContext.critterDataLoader.refresh(critterbaseCritterId)

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

export default CreateCapturePage;
