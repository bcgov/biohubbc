import { LoadingButton } from '@mui/lab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { CreateObservationI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateObservationRequest } from 'interfaces/useObservationApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import ObservationForm from '../form/ObservationForm';

export const initialSubcountValues = {
  observation_subcount_id: null,
  subcount: null,
  comment: null,
  qualitative_measurements: [],
  quantitative_measurements: [],
  qualitative_environments: [],
  quantitative_environments: []
};

const initialObservationValues: IObservationTableRowToSave = {
  standardColumns: {
    survey_observation_id: '' as unknown as number,
    itis_tsn: null,
    itis_scientific_name: null,
    survey_sample_site_id: null,
    survey_sample_method_id: null,
    survey_sample_period_id: null,
    count: null,
    observation_date: null,
    observation_time: null,
    latitude: null,
    longitude: null
  },
  subcounts: [initialSubcountValues]
};

/**
 * Page for creating an observation
 *
 * @return {*}
 */
const CreateObservationPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<ICreateObservationRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  // Project and survey details for breadcrumbs
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const projectName = projectContext.projectDataLoader.data?.projectData.project.project_name;
  const surveyName = surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name;
  const { projectId, surveyId } = surveyContext;

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateObservationI18N.createErrorTitle,
      dialogText: CreateObservationI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  /**
   * Creates a new observation
   *
   * @param {ICreateObservationRequest} observationPostObject
   * @return {*}
   */
  const createObservation = async (observationPostObject: ICreateObservationRequest) => {
    setIsSaving(true);
    try {
      await biohubApi.observation.createObservation(projectId, surveyId, observationPostObject);

      setEnableCancelCheck(false);
      history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations`);
    } catch (error) {
      showCreateErrorDialog({ dialogTitle: String(error) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Create Observation"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/`}>
              {projectName}
            </Link>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/surveys/${surveyId}`}>
              {surveyName}
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectId}/surveys/${surveyId}/observations`}>
              Observations
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Create Observation
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-observation-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <ObservationForm
            initialData={initialObservationValues}
            handleSubmit={(formikData) => createObservation(formikData)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-observation-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateObservationPage;
