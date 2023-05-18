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
import { PublishStatus } from 'constants/attachments';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import PublishDialogs from '../PublishDialogs';
import AttachmentsFileCard from './AttachmentsFileCard';
import RemoveOrResubmitForm, {
  IRemoveOrResubmitForm,
  RemoveOrResubmitFormInitialValues,
  RemoveOrResubmitFormYupSchema
} from './RemoveOrResubmitForm';

export interface IRemoveOrResubmitDialog {
  fileName: string;
  status: PublishStatus;
  parentName: string;
  submittedDate?: string;
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
  const { fileName, status, parentName, submittedDate, open, onClose } = props;

  const theme = useTheme();
  const biohubApi = useBiohubApi();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const router = useHistory();

  const [finishResubmission, setFinishResubmission] = useState(false);
  const [resubmissionFailed, setResubmissionFailed] = useState(false);

  const formikRef = useRef<FormikProps<IRemoveOrResubmitForm>>(null);

  const handleSubmit = async (values: IRemoveOrResubmitForm) => {
    try {
      onClose();
      await biohubApi.publish.resubmitAttachment(fileName, parentName, values, router.location.pathname);
      setFinishResubmission(true);
    } catch (error) {
      onClose();
      setResubmissionFailed(true);
    }
  };

  return (
    <>
      <PublishDialogs
        finishSubmissionTitle="Request Submitted"
        finishSubmissionMessage="Your request to remove or resubmit information has been submitted."
        finishSubmissionBody="A BioHub Administrator will contact you shortly."
        finishSubmission={finishResubmission}
        setFinishSubmission={setFinishResubmission}
        noSubmissionTitle="An Error Occurred"
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
              <strong>FILE DETAILS</strong>
            </Typography>
            <Box py={2}>
              <AttachmentsFileCard fileName={fileName} status={status} submittedDate={submittedDate} />
            </Box>
          </Box>

          <Box>
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
          <Button onClick={onClose} color="primary" variant="outlined" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RemoveOrResubmitDialog;
