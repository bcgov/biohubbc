import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSamplingSiteRequest, IGetSampleLocationDetailsForUpdate } from 'interfaces/useSamplingSiteApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import SamplingSiteHeader from '../components/SamplingSiteHeader';
import SampleSiteEditForm, { samplingSiteYupSchema } from './form/SampleSiteEditForm';

/**
 * Page to edit a sampling site.
 *
 * @return {*}
 */
const SamplingSiteEditPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId = Number(urlParams['survey_sample_site_id']);

  const [initialFormValues, setInitialFormValues] = useState<IGetSampleLocationDetailsForUpdate>();

  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

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
      setInitialFormValues(samplingSiteDataLoader.data);
      formikRef.current?.setValues(samplingSiteDataLoader.data);
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
          methods: values.sample_methods,
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
          history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`);
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
        open: true,
        dialogTitle: CreateSamplingSiteI18N.cancelTitle,
        dialogText: CreateSamplingSiteI18N.cancelText,
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

  if (!surveyContext.surveyDataLoader.data || !initialFormValues) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  console.log(samplingSiteDataLoader.data);

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
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

export default SamplingSiteEditPage;
