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
import React, { useRef } from 'react';
import AttachmentsFileCard from './AttachmentsFileCard';
import RemoveOrResubmitForm, {
  IRemoveOrResubmitForm,
  RemoveOrResubmitFormInitialValues,
  RemoveOrResubmitFormYupSchema
} from './RemoveOrResubmitForm';

export interface IRemoveOrResubmitDialog {
  file: any;
  open: boolean;
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const formikRef = useRef<FormikProps<IRemoveOrResubmitForm>>(null);

  const handleSubmit = async (values: IRemoveOrResubmitForm) => {
    console.log('handleSubmit', values);
  };

  return (
    <>
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
