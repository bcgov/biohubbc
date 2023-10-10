import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import SamplingSiteHeader from '../SamplingSiteHeader';
import SampleSiteEditForm, { IEditSamplingSiteRequest } from './components/SampleSiteEditForm';

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

      await biohubApi.samplingSite.editSampleSite(
        surveyContext.projectId,
        surveyContext.surveyId,
        surveySampleSiteId,
        values
      );

      // Disable cancel prompt so we can navigate away from the page after saving
      setEnableCancelCheck(false);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
        dialogText: CreateSamplingSiteI18N.createErrorText,
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

      <Box display="flex" flexDirection="column" height="100%">
        <Box
          position="sticky"
          top="0"
          zIndex={1001}
          sx={{
            borderBottomStyle: 'solid',
            borderBottomWidth: '1px',
            borderBottomColor: grey[300]
          }}>
          <SamplingSiteHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            is_submitting={isSubmitting}
            title="Edit Sampling Site"
            breadcrumb="Edit Sampling Sites"
          />
        </Box>
        <Box display="flex" flex="1 1 auto">
          <SampleSiteEditForm formikRef={formikRef} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Box>
      </Box>
    </>
  );
};

export default SamplingSiteEditPage;
