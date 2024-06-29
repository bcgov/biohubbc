import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IEditSamplingSiteRequest, IGetSampleLocationDetailsForUpdate } from 'interfaces/useSamplingSiteApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import SamplingSiteHeader from '../components/SamplingSiteHeader';
import SampleSiteEditForm, { samplingSiteYupSchema } from './form/SampleSiteEditForm';

/**
 * Page to edit a sampling site.
 *
 * @return {*}
 */
export const EditSamplingSitePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId = Number(urlParams['survey_sample_site_id']);

  const [initialFormValues, setInitialFormValues] = useState<IGetSampleLocationDetailsForUpdate>();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const formikRef = useRef<FormikProps<IGetSampleLocationDetailsForUpdate>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const projectId = surveyContext.projectId;
  const surveyId = surveyContext.surveyId;

  const samplingSiteDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSiteById(projectId, surveyId, surveySampleSiteId)
  );

  if (!samplingSiteDataLoader.data) {
    samplingSiteDataLoader.load();
  }

  useEffect(() => {
    if (samplingSiteDataLoader.data) {
      const data = samplingSiteDataLoader.data;

      data.sample_methods.forEach((method) => (method.method_technique_id = method.technique.method_technique_id));

      setInitialFormValues(data);
      formikRef.current?.setValues(data);
    }
  }, [samplingSiteDataLoader.data]);

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
      dialogText: CreateSamplingSiteI18N.createErrorText,
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

  const handleSubmit = async (values: IGetSampleLocationDetailsForUpdate) => {
    try {
      setIsSubmitting(true);

      // create edit request
      const editSampleSite: IEditSamplingSiteRequest = {
        sampleSite: {
          name: values.name,
          description: values.description,
          survey_id: values.survey_id,
          survey_sample_sites: [values.geojson as Feature],
          geojson: values.geojson,
          methods: values.sample_methods.map((method) => ({
            survey_sample_method_id: method.survey_sample_method_id,
            survey_sample_site_id: method.survey_sample_site_id,
            method_technique_id: method.method_technique_id,
            description: method.description,
            method_response_metric_id: method.method_response_metric_id,
            sample_periods: method.sample_periods
          })),
          blocks: values.blocks.map((block) => ({ survey_block_id: block.survey_block_id })),
          stratums: values.stratums.map((stratum) => ({ survey_stratum_id: stratum.survey_stratum_id }))
        }
      };

      // send edit request
      await biohubApi.samplingSite
        .editSampleSite(surveyContext.projectId, surveyContext.surveyId, surveySampleSiteId, editSampleSite)
        .then(() => {
          // Disable cancel prompt so we can navigate away from the page after saving
          setEnableCancelCheck(false);
          setIsSubmitting(false);

          // Refresh the context, so the next page loads with the latest data
          surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

          // create complete, navigate back to observations page
          history.push(
            `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`,
            SKIP_CONFIRMATION_DIALOG
          );
          surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
        })
        .catch((error: any) => {
          dialogContext.setYesNoDialog({ open: false });
          dialogContext.setSnackbar({
            snackbarMessage: (
              <>
                <Typography variant="body2" component="div">
                  <strong>Error Submitting Sampling Site</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  {String(error)}
                </Typography>
              </>
            ),
            open: true
          });
          setIsSubmitting(false);

          return;
        });
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
        dialogText: CreateSamplingSiteI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
  };

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data || !initialFormValues) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={initialFormValues}
        validationSchema={samplingSiteYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" height="100%">
          <SamplingSiteHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Edit Sampling Site"
            breadcrumb="Edit Sampling Site"
          />
          <SampleSiteEditForm isSubmitting={isSubmitting} />
        </Box>
      </Formik>
    </>
  );
};
