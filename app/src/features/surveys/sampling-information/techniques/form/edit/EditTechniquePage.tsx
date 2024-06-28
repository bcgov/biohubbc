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
import { EditTechniqueI18N } from 'constants/i18n';
import TechniqueFormContainer, {
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/form/components/TechniqueFormContainer';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IUpdateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';

/**
 * Renders the body content of the Technique page.
 *
 * @return {*}
 */
const EditTechniquePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const methodTechniqueId = Number(urlParams['method_technique_id']);

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formikRef = useRef<FormikProps<UpdateTechniqueFormValues>>(null);

  const techniqueDataLoader = useDataLoader(() =>
    biohubApi.technique.getTechniqueById(surveyContext.projectId, surveyContext.surveyId, methodTechniqueId)
  );

  useEffect(() => {
    techniqueDataLoader.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const technique = techniqueDataLoader.data;

  if (!technique) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const initialTechniqueValues: UpdateTechniqueFormValues = {
    method_technique_id: technique.method_technique_id,
    name: technique.name ?? null,
    description: technique?.description ?? null,
    distance_threshold: technique?.distance_threshold ?? null,
    method_lookup_id: technique?.method_lookup_id ?? null,
    attractants: technique?.attractants,
    attributes: [
      ...(technique?.attributes.qualitative_attributes.map((attribute) => ({
        _id: v4(), // A temporary unique id for react keys, etc, as the attribute_id is not unique
        attribute_id: attribute.method_technique_attribute_qualitative_id ?? null,
        attribute_lookup_id: attribute.method_lookup_attribute_qualitative_id,
        attribute_value: attribute.method_lookup_attribute_qualitative_option_id,
        attribute_type: 'qualitative' as const
      })) ?? []),
      ...(technique?.attributes.quantitative_attributes.map((attribute) => ({
        _id: v4(), // A temporary unique id for react keys, etc, as the attribute_id is not unique
        attribute_id: attribute.method_technique_attribute_quantitative_id ?? null,
        attribute_lookup_id: attribute.method_lookup_attribute_quantitative_id,
        attribute_value: attribute.value,
        attribute_type: 'quantitative' as const
      })) ?? [])
    ]
  };

  const handleSubmit = async (values: UpdateTechniqueFormValues) => {
    try {
      setIsSubmitting(true);

      const formattedTechniqueObject: IUpdateTechniqueRequest = {
        ...values,
        attributes: {
          quantitative_attributes: values.attributes
            .filter((attribute) => attribute.attribute_type === 'quantitative')
            .map((attribute) => ({
              method_technique_attribute_quantitative_id: attribute.attribute_id,
              method_lookup_attribute_quantitative_id: attribute.attribute_lookup_id,
              value: attribute.attribute_value as number
            })),
          qualitative_attributes: values.attributes
            .filter((attribute) => attribute.attribute_type === 'qualitative')
            .map((attribute) => ({
              method_technique_attribute_qualitative_id: attribute.attribute_id,
              method_lookup_attribute_qualitative_id: attribute.attribute_lookup_id,
              method_lookup_attribute_qualitative_option_id: attribute.attribute_value as string
            }))
        }
      };

      // Update the technique
      await biohubApi.technique.updateTechnique(
        surveyContext.projectId,
        surveyContext.surveyId,
        methodTechniqueId,
        formattedTechniqueObject
      );

      // Refresh the context, so the next page loads with the latest data
      surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // Success, navigate back to the manage sampling information page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      setIsSubmitting(false);
      dialogContext.setErrorDialog({
        dialogTitle: EditTechniqueI18N.createErrorTitle,
        dialogText: EditTechniqueI18N.createErrorText,
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
    }
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit Technique"
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
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`}
              underline="none">
              Manage Sampling Information
            </Link>
            <Typography component="span" variant="body2" color="textSecondary">
              Edit Technique
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
          <TechniqueFormContainer
            initialData={initialTechniqueValues}
            handleSubmit={(formikData) => handleSubmit(formikData)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
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
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
              }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default EditTechniquePage;
