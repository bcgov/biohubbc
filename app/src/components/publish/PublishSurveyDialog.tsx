import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SubmitBiohubI18N, SubmitSurveyBiohubI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import PublishSurveyIdContent from './components/PublishSurveyContent';

export interface ISubmitSurvey {
  submissionComment: string;
  agreement1: boolean;
  agreement2: boolean;
  agreement3: boolean;
}

interface IPublishSurveyIdDialogProps {
  open: boolean;
  onClose: () => void;
}

const surveySubmitFormInitialValues: ISubmitSurvey = {
  submissionComment: '',
  agreement1: false,
  agreement2: false,
  agreement3: false
};

const surveySubmitFormYupSchema = yup.object().shape({
  submissionComment: yup.string(),
  agreement1: yup.boolean().oneOf([true], 'You must accept all agreements.'),
  agreement2: yup.boolean().oneOf([true], 'You must accept all agreements.'),
  agreement3: yup.boolean().oneOf([true], 'You must accept all agreements.')
});

/**
 * Survey Publish button.
 *
 * @return {*}
 */
const PublishSurveyDialog = (props: IPublishSurveyIdDialogProps) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const surveyWithDetails = surveyContext.surveyDataLoader.data;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const formikRef = useRef<FormikProps<ISubmitSurvey>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = async (values: ISubmitSurvey) => {
    if (values === surveySubmitFormInitialValues) {
      showErrorDialog({
        dialogTitle: SubmitBiohubI18N.noInformationDialogTitle,
        dialogText: SubmitBiohubI18N.noInformationDialogText
      });
      return;
    }

    setIsSubmitting(true);

    return biohubApi.publish
      .publishSurveyData(surveyContext.surveyId, values)
      .then(() => {
        setShowSuccessDialog(true);
      })
      .catch(() => {
        setShowSuccessDialog(false);
        showErrorDialog({
          dialogTitle: SubmitBiohubI18N.submitBiohubErrorTitle,
          dialogText: SubmitBiohubI18N.submitBiohubErrorText
        });
      })
      .finally(() => {
        surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
        setIsSubmitting(false);
        props.onClose();
      });
  };

  if (!surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const publishDate = surveyWithDetails.surveySupplementaryData.survey_metadata_publish?.event_timestamp.split(' ')[0];

  return (
    <>
      <ComponentDialog
        dialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogTitle}
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}>
        <DialogContentText id="alert-dialog-description">
          {SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogText}
        </DialogContentText>
      </ComponentDialog>

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={props.open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description"
        scroll="body">
        <Formik<ISubmitSurvey>
          innerRef={formikRef}
          initialValues={surveySubmitFormInitialValues}
          validationSchema={surveySubmitFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={handleSubmit}>
          {(formikProps) => (
            <>
              <DialogTitle id="component-dialog-title">
                {SubmitSurveyBiohubI18N.submitSurveyBiohubDialogTitle}
              </DialogTitle>
              <DialogContent>
                <PublishSurveyIdContent />
              </DialogContent>
              <DialogActions>
                <Typography component="span" variant="subtitle2" sx={{ mr: 2 }}>
                  <Typography component="span" color="textSecondary" variant="inherit">
                    {publishDate ? (
                      <span>
                        Status:&nbsp;&nbsp;<b>Published ({publishDate})</b>
                      </span>
                    ) : (
                      <span>
                        Status:&nbsp;&nbsp;<b>Unpublished</b>
                      </span>
                    )}
                  </Typography>
                </Typography>
                <LoadingButton
                  onClick={formikProps.submitForm}
                  color="primary"
                  variant="contained"
                  disabled={
                    !(
                      formikProps.values.agreement1 &&
                      formikProps.values.agreement2 &&
                      formikProps.values.agreement3
                    ) || isSubmitting
                  }
                  loading={isSubmitting}>
                  Publish
                </LoadingButton>
                <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogActions>
            </>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default PublishSurveyDialog;
