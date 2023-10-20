import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Formik } from 'formik';
import React from 'react';

export interface IRequestDialogComponent {
  element: any;
  initialValues: any;
  validationSchema: any;
}

export interface IRequestDialog {
  /**
   * The Formik compatible component to render in the dialog content body.
   *
   * @type {IRequestDialogComponent}
   * @memberof IRequestDialog
   */
  component: IRequestDialogComponent;
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IRequestDialog
   */
  dialogTitle: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IRequestDialog
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IRequestDialog
   */
  onClose: () => void;
  /**
   * Callback fired if the 'Deny' button is clicked.
   *
   * @memberof IRequestDialog
   */
  onDeny: () => void;
  /**
   * Callback fired if the 'Approve' button is clicked.
   *
   * @memberof IRequestDialog
   */
  onApprove: (values: any) => void;
}

const RequestDialog: React.FC<IRequestDialog> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <Box>
      <Formik
        initialValues={props.component.initialValues}
        enableReinitialize={true}
        validationSchema={props.component.validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          props.onApprove(values);
        }}>
        {(formikProps) => (
          <Dialog open={props.open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="access-request-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>{props.component.element}</DialogContent>
            <DialogActions>
              <Button
                color="primary"
                variant="contained"
                data-testid="request_approve_button"
                onClick={formikProps.submitForm}
                autoFocus>
                Approve
              </Button>
              <Button color="primary" variant="contained" data-testid="request_deny_button" onClick={props.onDeny}>
                Deny
              </Button>
              <Button onClick={props.onClose} color="primary" variant="outlined">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </Box>
  );
};

export default RequestDialog;
