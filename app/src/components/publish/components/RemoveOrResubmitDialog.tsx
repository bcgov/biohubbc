import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import FailureDialog from 'components/dialog/FailureDialog';
import SuccessDialog from 'components/dialog/SuccessDialog';
import { PublishStatus } from 'constants/attachments';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import AttachmentsFileCard from './AttachmentsFileCard';
import RemoveOrResubmitForm, {
  IRemoveOrResubmitForm,
  RemoveOrResubmitFormInitialValues,
  RemoveOrResubmitFormYupSchema
} from './RemoveOrResubmitForm';

export interface IRemoveOrResubmitDialog {
  projectId: number;
  fileName: string;
  status: PublishStatus;
  parentName: string;
  submittedDate?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const RemoveOrResubmitDialog: React.FC<IRemoveOrResubmitDialog> = (props) => {
  const { projectId, fileName, status, parentName, submittedDate, open, onClose } = props;

  const theme = useTheme();
  const biohubApi = useBiohubApi();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const router = useHistory();

  const [successSubmission, setSuccessSubmission] = useState(false);
  const [failureSubmission, setFailureSubmission] = useState(false);

  const formikRef = useRef<FormikProps<IRemoveOrResubmitForm>>(null);

  const handleSubmit = async (values: IRemoveOrResubmitForm) => {
    try {
      onClose();
      await biohubApi.publish.resubmitAttachment(projectId, fileName, parentName, values, router.location.pathname);
      setSuccessSubmission(true);
    } catch (error) {
      onClose();
      setFailureSubmission(true);
    }
  };

  return (
    <>
      <SuccessDialog
        successTitle="Request Submitted"
        successMessage="Your request to remove or resubmit information has been submitted."
        successBody="A BioHub Administrator will contact you shortly."
        open={successSubmission}
        onClose={() => setSuccessSubmission(false)}
      />

      <FailureDialog
        failureTitle="An Error Occurred"
        failureMessage="An error occurred while attempting to submit your request."
        failureBody="If you continue to have difficulties submitting your request, please contact BioHub Support at biohub@gov.bc.ca."
        open={failureSubmission}
        onClose={() => setFailureSubmission(false)}
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
