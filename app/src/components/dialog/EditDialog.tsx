import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';
import { Formik } from 'formik';

export interface IEditDialogComponentProps {
  element: any;
  initialValues: any;
  validationSchema: any;
}

export interface IEditDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IEditDialogProps
   */
  open: boolean;

  /**
   * @type {IEditDialogComponentProps}
   * @memberof IEditDialogProps
   */
  component: IEditDialogComponentProps;

  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IEditDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'No' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onCancel: () => void;
  /**
   * Callback fired if the 'Yes' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onSave: (values: IEditDialogComponentProps) => void;
  //Add interface for the values
}

/**
 * A dialog for displaying a component for editing purposes and giving the user the option to say
 * `Yes`(Save) or `No`.
 *
 * @param {*} props
 * @return {*}
 */
export const EditDialog: React.FC<IEditDialogProps> = (props) => {
  return (
    <Box>
      <Formik
        initialValues={props.component.initialValues}
        validationSchema={props.component.validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          props.onSave(values);
        }}>
        {(formikProps) => (
          <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>
              {props?.component?.element}
              <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={props.onCancel} color="primary">
                No
              </Button>
              <Button onClick={formikProps.submitForm} color="primary" autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </Box>
  );
};

export default EditDialog;
