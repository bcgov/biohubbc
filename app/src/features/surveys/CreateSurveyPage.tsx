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
import { CreateSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { ISurveyPermitForm, SurveyPermitFormInitialValues } from 'features/surveys/components/permit/SurveyPermitForm';
import { SurveyPartnershipsFormInitialValues } from 'features/surveys/view/components/SurveyPartnershipsForm';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { AgreementsInitialValues } from './components/agreements/AgreementsForm';
import { ProprietaryDataInitialValues } from './components/agreements/ProprietaryDataForm';
import { SurveyLocationInitialValues } from './components/areas/SurveyAreaFormContainer';
import {
  ISurveyFundingSourceForm,
  SurveyFundingSourceFormInitialValues
} from './components/funding/SurveyFundingSourceForm';
import { GeneralInformationInitialValues } from './components/general-information/GeneralInformationForm';
import { PurposeAndMethodologyInitialValues } from './components/methodology/PurposeAndMethodologyForm';
import { SurveyUserJobFormInitialValues } from './components/participants/SurveyUserForm';
import { SurveySiteSelectionInitialValues } from './components/sampling-strategy/SurveySiteSelectionForm';
import { SpeciesInitialValues } from './components/species/SpeciesForm';
import EditSurveyForm from './edit/EditSurveyForm';

export const defaultSurveyDataFormValues: ICreateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm = {
  ...GeneralInformationInitialValues,
  ...SurveyPermitFormInitialValues,
  ...PurposeAndMethodologyInitialValues,
  ...SurveyFundingSourceFormInitialValues,
  ...SurveyPartnershipsFormInitialValues,
  ...ProprietaryDataInitialValues,
  ...AgreementsInitialValues,
  ...SurveyLocationInitialValues,
  ...SurveySiteSelectionInitialValues,
  ...SurveyUserJobFormInitialValues,
  ...SpeciesInitialValues
};

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const CreateSurveyPage = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);
  const codes = codesContext.codesDataLoader.data;

  const projectContext = useContext(ProjectContext);
  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const formikRef = useRef<FormikProps<IEditSurveyRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSaving, setIsSaving] = useState(false);

  const dialogContext = useContext(DialogContext);

  const handleCancel = () => {
    history.push(`/admin/projects/${projectData?.project.project_id}`);
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSurveyI18N.createErrorTitle,
      dialogText: CreateSurveyI18N.createErrorText,
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
   * Handle creation of surveys.
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm) => {
    setIsSaving(true);
    try {
      // Remove the permit_used and funding_used properties
      const response = await biohubApi.survey.createSurvey(Number(projectData?.project.project_id), {
        blocks: values.blocks,
        funding_sources: values.funding_sources,
        locations: values.locations.map((location) => ({
          survey_location_id: location.survey_location_id,
          geojson: location.geojson,
          name: location.name,
          description: location.description,
          revision_count: location.revision_count
        })),
        participants: values.participants,
        partnerships: values.partnerships,
        permit: {
          permits: values.permit.permits
        },
        proprietor: values.proprietor,
        site_selection: {
          stratums: values.site_selection.stratums.map((stratum) => ({
            survey_stratum_id: stratum.survey_stratum_id,
            name: stratum.name,
            description: stratum.description
          })),
          strategies: values.site_selection.strategies
        },
        species: values.species,
        survey_details: values.survey_details,
        purpose_and_methodology: values.purpose_and_methodology,
        agreements: values.agreements
      });

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      history.push(
        `/admin/projects/${projectData?.project.project_id}/surveys/${response.id}/details`,
        SKIP_CONFIRMATION_DIALOG
      );
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

  if (!codes || !projectData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Create New Survey"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectData.project.project_id}/`}>
              {projectData.project.project_name}
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Create New Survey
            </Typography>
          </Breadcrumbs>
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
          <EditSurveyForm
            initialSurveyData={defaultSurveyDataFormValues}
            handleSubmit={(formikData) =>
              handleSubmit(formikData as unknown as ICreateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm)
            }
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

export default CreateSurveyPage;
