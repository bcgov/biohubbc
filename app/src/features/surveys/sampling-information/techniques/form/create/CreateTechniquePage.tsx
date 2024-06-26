import LoadingButton from '@mui/lab/LoadingButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { CreateTechniqueI18N } from 'constants/i18n';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { default as TechniqueForm, TechniqueFormValues } from '../components/TechniqueForm';

const initialTechniqueFormValues: TechniqueFormValues = {
  name: '',
  description: '',
  distance_threshold: null,
  method_lookup_id: null,
  attractants: [],
  attributes: []
};

/**
 * Renders the body content of the create technique page.
 *
 * @return {*}
 */
export const CreateTechniquePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formikRef = useRef<FormikProps<TechniqueFormValues>>(null);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSubmit = async (values: TechniqueFormValues) => {
    try {
      setIsSubmitting(true);

      // Parse the form data into the request format
      const createTechniqueRequestData: ICreateTechniqueRequest = {
        ...values,
        attributes: {
          qualitative_attributes: values.attributes
            .filter(({ attribute_type }) => attribute_type === 'qualitative')
            .map((item) => ({
              method_technique_attribute_qualitative_id: null,
              method_lookup_attribute_qualitative_id: item.attribute_lookup_id,
              method_lookup_attribute_qualitative_option_id: item.attribute_value as string
            })),
          quantitative_attributes: values.attributes
            .filter(({ attribute_type }) => attribute_type === 'quantitative')
            .map((item) => ({
              method_technique_attribute_quantitative_id: null,
              method_lookup_attribute_quantitative_id: item.attribute_lookup_id,
              value: item.attribute_value as number
            }))
        }
      };

      await biohubApi.technique.createTechniques(surveyContext.projectId, surveyContext.surveyId, [
        createTechniqueRequestData
      ]);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
    } catch (error) {
      dialogContext.setErrorDialog({
        dialogTitle: CreateTechniqueI18N.createErrorTitle,
        dialogText: CreateTechniqueI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        open: true
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Create New Technique"
        breadCrumbJSX={
          <Breadcrumbs
            aria-label="breadcrumb"
            separator=">"
            sx={{
              typography: 'body2'
            }}>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/details`}
              underline="none">
              {projectContext.projectDataLoader.data?.projectData.project.project_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/details`}
              underline="none">
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`}
              underline="none">
              Observations
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`}
              underline="none">
              Manage Sampling Information
            </Link>
            <Typography component="span" variant="body2" color="textSecondary">
              Create New Technique
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              loading={isSubmitting}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </LoadingButton>
            <Button
              disabled={isSubmitting}
              color="primary"
              variant="outlined"
              onClick={() =>
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`)
              }>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <TechniqueForm
            initialData={initialTechniqueFormValues}
            handleSubmit={(formikData) => handleSubmit(formikData as TechniqueFormValues)}
            formikRef={formikRef}
          />
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                formikRef.current?.submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(
                  `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`
                );
              }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};
