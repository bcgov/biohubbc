import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { mdiCheck, mdiWindowClose } from '@mdi/js';
import Icon from '@mdi/react';
import { IBaseDialogProps } from 'contexts/dialogContext';
import { Formik } from 'formik';
import React from 'react';

export interface IRequestDialogComponent {
  element: any;
  initialValues: any;
  validationSchema: any;
}

export interface IRequestDialog extends IBaseDialogProps {
  /**
   * The Formik compatible component to render in the dialog content body.
   *
   * @type {IRequestDialogComponent}
   * @memberof IRequestDialog
   */
  component: IRequestDialogComponent;
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
            <DialogContent>
              <Box py={2}>{props.component.element}</Box>
            </DialogContent>
            <DialogActions>
              <Button
                data-testid="request_approve_button"
                startIcon={<Icon path={mdiCheck} size={1} />}
                onClick={formikProps.submitForm}
                color="primary"
                variant="contained"
                autoFocus>
                Approve
              </Button>
              <Button
                data-testid="request_deny_button"
                startIcon={<Icon path={mdiWindowClose} size={1} />}
                onClick={props.onDeny}
                color="primary"
                variant="outlined">
                Deny
              </Button>
              <Box pl={3}>
                <Button onClick={props.onClose} color="primary" variant="outlined">
                  Cancel
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </Box>
  );
};

export default RequestDialog;
