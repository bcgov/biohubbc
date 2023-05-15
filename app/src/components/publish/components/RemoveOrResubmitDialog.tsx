import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useRef, useState } from 'react';
import PublishDialogs from '../PublishDialogs';
import AttachmentsFileCard from './AttachmentsFileCard';
import RemoveOrResubmitForm, {
  IRemoveOrResubmitForm,
  RemoveOrResubmitFormInitialValues,
  RemoveOrResubmitFormYupSchema
} from './RemoveOrResubmitForm';

export interface IRemoveOrResubmitDialog {
  file: IGetProjectAttachment | IGetSurveyAttachment | null;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  onClose: () => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const RemoveOrResubmitDialog: React.FC<IRemoveOrResubmitDialog> = (props) => {
  const { file, open, onClose } = props;

  const theme = useTheme();
  const biohubApi = useBiohubApi();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [finishResubmission, setFinishResubmission] = useState(false);
  const [resubmissionFailed, setResubmissionFailed] = useState(false);

  const formikRef = useRef<FormikProps<IRemoveOrResubmitForm>>(null);

  const handleSubmit = async (values: IRemoveOrResubmitForm) => {
    try {
      onClose();
      if (file) {
        await biohubApi.publish.resubmitAttachment(file, values);
        setFinishResubmission(true);
      }
    } catch (error) {
      console.log(error);
      onClose();
      setResubmissionFailed(true);
    }
  };

  if (!file) {
    return <></>;
  }

  return (
    <>
      <PublishDialogs
        finishSubmissionTitle="Project documents submitted"
        finishSubmissionMessage="Thank you for submitting your project data to Biohub."
        finishSubmissionBody="A BioHub Administrator will contact you shortly."
        finishSubmission={finishResubmission}
        setFinishSubmission={setFinishResubmission}
        noSubmissionTitle="No documents to submit"
        noSubmissionMessage="An error occurred while attempting to submit your request."
        noSubmissionBody="If you continue to have difficulties submitting your request, please contact BioHub Support at biohub@gov.bc.ca."
        noSubmissionData={resubmissionFailed}
        setNoSubmissionData={setResubmissionFailed}
      />

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
        <DialogTitle id="component-dialog-title">Remove or Resubmit File</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <strong>Submitted files are locked and cannot be removed.</strong>
          </DialogContentText>
          <DialogContentText id="alert-dialog-description">
            You can request to remove or resubmit this file by providing your contact information and a short
            description of the request.
          </DialogContentText>

          <Box py={2}>
            <Typography variant="body1">
              <strong>File Details</strong>
            </Typography>
            <Box py={2}>
              <AttachmentsFileCard attachment={file} />
            </Box>
          </Box>

          <Box py={2}>
            <Formik
              innerRef={formikRef}
              initialValues={RemoveOrResubmitFormInitialValues}
              validationSchema={RemoveOrResubmitFormYupSchema}
              validateOnBlur={true}
              validateOnChange={false}
              enableReinitialize={true}
              onSubmit={handleSubmit}>
              <RemoveOrResubmitForm />
            </Formik>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => formikRef.current?.submitForm()} color="primary" variant="contained" autoFocus>
            Submit Request
          </Button>
          <Button onClick={onClose} color="secondary" variant="contained" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RemoveOrResubmitDialog;
