import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import SamplingSiteHeader from '../SamplingSiteHeader';
import SampleSiteEditForm, { IEditSamplingSiteRequest, samplingSiteYupSchema } from './components/SampleSiteEditForm';

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

  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const formikRef = useRef<FormikProps<IEditSamplingSiteRequest>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [initialFormData, setInitialFormData] = useState<IEditSamplingSiteRequest>({
    sampleSite: {
      survey_id: surveyContext.surveyId,
      name: '',
      description: '',
      survey_sample_sites: [],
      methods: [],
      blocks: []
    }
  });

  // Initial load of the sampling site data
  useEffect(() => {
    if (surveyContext.sampleSiteDataLoader.data) {
      const data = surveyContext.sampleSiteDataLoader.data.sampleSites.find(
        (sampleSite) => sampleSite.survey_sample_site_id === surveySampleSiteId
      );

      if (data !== undefined) {
        const formInitialValues: IEditSamplingSiteRequest = {
          sampleSite: {
            name: data.name,
            description: data.description,
            survey_id: data.survey_id,
            survey_sample_sites: [data.geojson as unknown as Feature],
            methods:
              data.sample_methods?.map((item) => {
                return {
                  ...item,
                  periods: item.sample_periods || []
                };
              }) || [],
            blocks: data.sample_blocks || []
          }
        };
        setInitialFormData(formInitialValues);
        formikRef.current?.setValues(formInitialValues);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.sampleSiteDataLoader]);

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

  const handleSubmit = async (values: IEditSamplingSiteRequest) => {
    try {
      setIsSubmitting(true);

      // create edit request
      const editSampleSite: IEditSamplingSiteRequest = {
        sampleSite: {
          name: values.sampleSite.name,
          description: values.sampleSite.description,
          survey_id: values.sampleSite.survey_id,
          survey_sample_sites: values.sampleSite.survey_sample_sites as unknown as Feature[],
          geojson: values.sampleSite.survey_sample_sites[0],
          methods: values.sampleSite.methods,
          blocks: values.sampleSite.blocks
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
  const handleLocationChange = (location: History.Location, action: History.Action) => {
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

  if (!surveyContext.surveyDataLoader.data || !surveyContext.sampleSiteDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />

      <Formik
        innerRef={formikRef}
        initialValues={initialFormData}
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
