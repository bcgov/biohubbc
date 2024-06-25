import LoadingButton from '@mui/lab/LoadingButton';
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
import { EditTechniqueI18N } from 'constants/i18n';
import { FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';
import TechniqueForm, { TechniqueFormValues } from '../components/TechniqueForm';

/**
 * Renders the body content of the Technique page.
 *
 * @return {*}
 */
const EditTechniquePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const urlParams: Record<string, string | number | undefined> = useParams();
  const techniqueId = Number(urlParams['method_technique_id']);

  const surveyContext = useSurveyContext();
  const { surveyId, projectId } = surveyContext;
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const formikRef = useRef<FormikProps<TechniqueFormValues>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const techniqueDataLoader = useDataLoader(() =>
    biohubApi.technique.getTechniqueById(projectId, surveyId, techniqueId)
  );

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  if (!techniqueDataLoader.data) {
    techniqueDataLoader.load();
  }

  const technique = techniqueDataLoader.data;

  if (!technique) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const initialTechniqueValues: TechniqueFormValues = {
    name: technique.name ?? null,
    description: technique?.description ?? null,
    distance_threshold: technique?.distance_threshold ?? null,
    method_lookup_id: technique?.method_lookup_id ?? null,
    attractants: technique?.attractants,
    attributes: [
      ...(technique?.attributes.qualitative_attributes.map((attribute) => ({
        _id: v4(), // attribute_id, which is the PK of the attribute, is not unique, so use temporary _id for unique key
        attribute_id: attribute.method_technique_attribute_qualitative_id ?? null,
        attribute_lookup_id: attribute.method_lookup_attribute_qualitative_id,
        attribute_value: attribute.method_lookup_attribute_qualitative_option_id,
        attribute_type: 'qualitative' as const
      })) ?? []),
      ...(technique?.attributes.quantitative_attributes.map((attribute) => ({
        _id: v4(), // attribute_id, which is the PK of the attribute, is not unique, so use temporary _id for unique key
        attribute_id: attribute.method_technique_attribute_quantitative_id ?? null,
        attribute_lookup_id: attribute.method_lookup_attribute_quantitative_id,
        attribute_value: attribute.value,
        attribute_type: 'quantitative' as const
      })) ?? [])
    ]
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/details`);
  };

  const defaultCancelDialogProps = {
    dialogTitle: EditTechniqueI18N.cancelTitle,
    dialogText: EditTechniqueI18N.cancelText,
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
      dialogTitle: EditTechniqueI18N.createErrorTitle,
      dialogText: EditTechniqueI18N.createErrorText,
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

  const handleSubmit = async (values: TechniqueFormValues) => {
    try {
      setIsSubmitting(true);
      setEnableCancelCheck(false);

      const { attributes, ...technique } = values;

      const formattedTechniqueObject = {
        ...technique,
        attributes: {
          quantitative_attributes: attributes
            .filter((attribute) => attribute.attribute_type === 'quantitative')
            .map((attribute) => ({
              method_technique_attribute_quantitative_id: attribute.attribute_id,
              method_lookup_attribute_quantitative_id: attribute.attribute_lookup_id,
              value: attribute.attribute_value as number
            })),
          qualitative_attributes: attributes
            .filter((attribute) => attribute.attribute_type === 'qualitative')
            .map((attribute) => ({
              method_technique_attribute_qualitative_id: attribute.attribute_id,
              method_lookup_attribute_qualitative_id: attribute.attribute_lookup_id,
              method_lookup_attribute_qualitative_option_id: attribute.attribute_value as string
            }))
        }
      };

      await biohubApi.technique.updateTechnique(
        surveyContext.projectId,
        surveyContext.surveyId,
        techniqueId,
        formattedTechniqueObject
      );

      // Refresh the context, so the next page loads with the latest data
      surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: EditTechniqueI18N.createErrorTitle,
        dialogText: EditTechniqueI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
      setIsSubmitting(false);
    }
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
    if (!dialogContext.yesNoDialogProps.open && !isSubmitting) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        open: true,
        dialogTitle: EditTechniqueI18N.cancelTitle,
        dialogText: EditTechniqueI18N.cancelText,
        onClose: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onNo: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        }
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
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
              to={`/admin/projects/${projectId}/surveys/${surveyId}/details`}
              underline="none">
              {projectContext.projectDataLoader.data?.projectData.project.project_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${projectId}/surveys/${surveyId}/details`}
              underline="none">
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${projectId}/surveys/${surveyId}/observations`}
              underline="none">
              Observations
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${projectId}/surveys/${surveyId}/sampling`}
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
            <Button disabled={isSubmitting} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <TechniqueForm
            initialData={initialTechniqueValues}
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

export default EditTechniquePage;
