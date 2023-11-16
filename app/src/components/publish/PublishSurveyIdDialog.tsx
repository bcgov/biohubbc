import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SubmitBiohubI18N, SubmitSurveyBiohubI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { useContext, useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import PublishSurveyIdContent from './components/PublishSurveyIdContent';

export interface ISubmitSurvey {
  additionalInformation: string;
  agreement1: boolean;
  agreement2: boolean;
  agreement3: boolean;
}

interface IPublishSurveyIdDialogProps {
  open: boolean;
  onClose: () => void;
}

const surveySubmitFormInitialValues: ISubmitSurvey = {
  additionalInformation: '',
  agreement1: false,
  agreement2: false,
  agreement3: false
};

const surveySubmitFormYupSchema = yup.object().shape({
  additionalInformation: yup.string(),
  agreement1: yup.boolean().oneOf([true], 'You must accept all agreements.'),
  agreement2: yup.boolean().oneOf([true], 'You must accept all agreements.'),
  agreement3: yup.boolean().oneOf([true], 'You must accept all agreements.')
});

/**
 * Survey Publish button.
 *
 * @return {*}
 */
const PublishSurveyIdDialog = (props: IPublishSurveyIdDialogProps) => {
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

  const [formikRef] = useState(useRef<FormikProps<ISubmitSurvey>>(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ISubmitSurvey) => {
    console.log('values', values);

    if (values === surveySubmitFormInitialValues) {
      showErrorDialog({
        dialogTitle: SubmitBiohubI18N.noInformationDialogTitle,
        dialogText: SubmitBiohubI18N.noInformationDialogText
      });
      return;
    }

    setIsSubmitting(true);
    props.onClose();

    // return biohubApi.publish.publishSurvey(projectId, surveyId, values);
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={props.open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
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
                  Publish Survey
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

export default PublishSurveyIdDialog;
